import amqp from "amqplib";
import { updateTransactionRepository } from "../Repositories/Transactions.repository.js";
import { createAttendeeRepository } from "../Repositories/Attendee.repository.js";
import { updateTicketRepository, getTicketByIdRepository } from "../Repositories/Ticket.repository.js";
import { Op, Sequelize } from "sequelize";
import sequelize from "../Utils/db.js";
import { sendTemplatedEmail } from '../Services/gossip_monger_email.js';
import {getEventByIdRepository} from "../Repositories/Event.repository.js";
import {getUserByIdRepository} from "../Repositories/User.repository.js";

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

    await channel.bindQueue(q.queue, "io.opencrafts.veribroke-notifications", "NDOVUKUU");

    console.log("👂");

    channel.consume(
      q.queue,
      async (msg) => {
        if (!msg) return;
        let dbTransaction = await sequelize.transaction();

        try {
          const routingKey = msg.fields.routingKey;
          const payload = JSON.parse(msg.content.toString());
          const { request_id, success, message, metadata, errors } = payload;
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
            user_id
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
              }, { transaction: dbTransaction })
          }

          await dbTransaction.commit();

          if (success) {
            const event = await getEventByIdRepository(event_id);
            const user_email = await getUserByIdRepository(user_id);

            const notificationPayload = {
              to_addresses: [user_email.email],
              subject: `Your ticket for ${event.event_name} has been confirmed`,
              template_id: "sherehe-ticket-confirmation",
              template_vars: {
                "created_at": `${new Date().toLocaleString('en-US', { 
  weekday: 'long', 
  month: 'long', 
  day: 'numeric', 
  year: 'numeric' 
})}`,
              "event_name": `${event.event_name}`,
              "id": `${ticket_id}`,
              "ticket_for": `${ticket.ticket_for}`,
              "ticket_name": `${ticket.ticket_name}`,
              "ticket_price": `${ticket.ticket_price}`,
              "ticket_quantity": `${attendeesToCreate}`,
            }
          };

          try {
            await sendTemplatedEmail(notificationPayload, "io.opencrafts.sherehe");
          } catch (emailError) {
            console.error("❌ Failed to send Mpesa success email:", emailError);
          }

          }

          channel.ack(msg);

        } catch (error) {
          if (!dbTransaction.finished) {
            await dbTransaction.rollback();
          }
          if (msg.fields.redelivered) {
            channel.ack(msg); // prevent infinite loop
          } else {
            channel.nack(msg, false, true);
          }
        }
      },
      { noAck: false }
    );
  } catch (error) {

    console.error("❌ Veribroke sdk recieve error:", error);
    throw error;
  }
}

