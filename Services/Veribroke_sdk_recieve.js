import amqp from "amqplib";
import { updateTransactionRepository } from "../Repositories/Transactions.repository.js";
import { createAttendeeRepository } from "../Repositories/Attendee.repository.js";
import { updateTicketRepository, getTicketByIdRepository } from "../Repositories/Ticket.repository.js";
import { Op, Sequelize } from "sequelize";
import sequelize from "../Utils/db.js";
import { sendPlainEmail } from '../Services/gossip_monger_email.js';
import { getEventByIdRepository } from "../Repositories/Event.repository.js";
import { getUserByIdRepository } from "../Repositories/User.repository.js";
import { sendUserPushNotification } from '../Services/gossip_monger_push_notification.js'
import {generateGoQrUrl} from '../Utils/generate_qr_code.js'
import {sendTicketPurchasedEmail} from '../Utils/Email.js'

const RABBITMQ_HOST = process.env.RABBITMQ_HOST
const RABBITMQ_PASSWORD = process.env.RABBITMQ_PASSWORD
const RABBITMQ_PORT = process.env.RABBITMQ_PORT
const RABBITMQ_USER = process.env.RABBITMQ_USER
const RABBITMQ_VHOST = process.env.RABBITMQ_VHOST
const EXCHANGE_NAME = process.env.RABBITMQ_NOTIFICATION_EXCHANGE || "io.opencrafts.veribroke-notifications"
const SHEREHE_ROUTING_KEY = process.env.SHEREHE_ROUTING_KEY || "NDOVUKUU"

const QUEUE = "sherehe_mpesa_success_queue";
const RABBIT_URL = `amqp://${RABBITMQ_USER}:${RABBITMQ_PASSWORD}@${RABBITMQ_HOST}:${RABBITMQ_PORT}${RABBITMQ_VHOST || '/'}`;

export async function startMpesaSuccessConsumer() {
  try {
    const connection = await amqp.connect(RABBIT_URL);
    const channel = await connection.createChannel();

    await channel.assertExchange(EXCHANGE_NAME, "topic", { durable: true });

    const q = await channel.assertQueue(QUEUE, {
      durable: true,
    });

    await channel.bindQueue(q.queue, EXCHANGE_NAME, SHEREHE_ROUTING_KEY);

    console.log("Monitoring M-Pesa queues successfully...");

    channel.consume(
      q.queue,
      async (msg) => {
        if (!msg) return;
        
        // Dynamic tracking variable to safely control rollbacks
        let transactionCommitted = false;
        let dbTransaction;

        try {
          dbTransaction = await sequelize.transaction();
          const payload = JSON.parse(msg.content.toString());
          const { request_id, success, message, metadata } = payload;
          const stkCallback = metadata?.Body?.stkCallback;

          const MerchantRequestID = stkCallback?.MerchantRequestID;
          const CheckoutRequestID = stkCallback?.CheckoutRequestID;

          let status;
          let failure_reason = null;

          if (success) {
            status = "SUCCESS";
          } else if (message === "Request Cancelled by user") {
            status = "CANCELLED";
          } else {
            status = "FAILED";
          }

          if (!success) {
            failure_reason = message;
          }

          const transaction = await updateTransactionRepository(
            request_id,
            {
              checkout_request_id: CheckoutRequestID || null,
              merchant_request_id: MerchantRequestID || null,
              status,
              failure_reason,
              provider_response: stkCallback || null
            },
            { transaction: dbTransaction }
          );

          const plainTransaction = transaction.get({ plain: true });
          const { user_id, event_id, ticket_id, ticket_quantity } = plainTransaction;

          const ticket = await getTicketByIdRepository(ticket_id);
          if (!ticket) {
            throw new Error(`Ticket not found for ticket_id: ${ticket_id}`);
          }

          const attendeesToCreate = ticket_quantity * ticket.ticket_for;
          
          if (success) {
            for (let i = 0; i < attendeesToCreate; i++) {
              await createAttendeeRepository(
                {
                  user_id,
                  event_id,
                  ticket_id,
                  ticket_quantity: 1
                },
                { transaction: dbTransaction }
              );
            }
          } else {
            await updateTicketRepository(
              ticket_id,
              {
                ticket_quantity: Sequelize.literal(
                  `ticket_quantity + ${ticket_quantity}`
                )
              }, 
              { transaction: dbTransaction }
            );
          }

          // Commit database state cleanly
          await dbTransaction.commit();
          transactionCommitted = true;

          // Post-Commit Communications Flow (Errors here won't crash DB states)
          if (success) {
            const event = await getEventByIdRepository(event_id);
            const user_email = await getUserByIdRepository(user_id);
            const url = await generateGoQrUrl(`https://academia.opencrafts.io/sherehe/get-event/${event_id}/event-tickets`);
            const created_at = new Date().toLocaleString('en-KE', {
                  timeZone: 'Africa/Nairobi',
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
                })
                

            const ticketEmail = await sendTicketPurchasedEmail(
              user_email.name,
              ticket_id,
              event.event_name , 
              event.event_description ,
              event.event_location ,
              event.start_date ,
              event.end_date ,
              event.event_card_image ,
              created_at,
               ticket.ticket_name , 
              ticket.ticket_for , 
              attendeesToCreate , 
              ticket.ticket_price ,
              ticket.start_date ,
              ticket.end_date ,
               url)
            const notificationPayload = {
              to_addresses: [user_email.email],
              subject: `Your ticket for ${event.event_name} has been confirmed`,
              body_html: ticketEmail,
              body_text: ticketEmail
            };

            try {
              await sendPlainEmail(notificationPayload, "io.opencrafts.sherehe");
            } catch (emailError) {
              console.error("Failed to send Mpesa success email:", emailError.message);
            }

            const pushNotificationPayload = {
              headings: `Your ticket for ${event.event_name} has been confirmed`,
              contents: `A confirmation email has been sent to ${user_email.email}`,
              target_user_id: user_id,
            };

            try {
              await sendUserPushNotification(pushNotificationPayload, "io.opencrafts.sherehe");
            } catch (pushError) {
              console.error(`Notification failed components fallback: ${pushError.message}`);
            }
          }

          // Safe execution acknowledge
          channel.ack(msg);

        } catch (error) {
          console.error("Error processing queue message:", error.message);
          
          // Only rollback if it hasn't been committed yet
          if (!transactionCommitted && dbTransaction) {
            try {
              await dbTransaction.rollback();
            } catch (rollbackError) {
              console.error("Transaction fallback rollback failed:", rollbackError.message);
            }
          }

          if (transactionCommitted) {
            channel.ack(msg);
          } else if (msg.fields.redelivered) {
            console.warn("Message redelivered and failed again. Acking to prevent loop.");
            channel.ack(msg);
          } else {
            channel.nack(msg, false, true);
          }
        }
      },
      { noAck: false }
    );
  } catch (error) {
    console.error("Veribroke SDK initialization error:", error);
    throw error;
  }
}