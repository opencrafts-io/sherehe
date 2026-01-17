import amqp from "amqplib";
import {updateTransactionRepository} from "../Repositories/Transactions.repository.js";
import {createAttendeeRepository} from "../Repositories/Attendee.repository.js";


const RABBITMQ_HOST=process.env.RABBITMQ_HOST
const RABBITMQ_PASSWORD=process.env.RABBITMQ_PASSWORD
const RABBITMQ_PORT=process.env.RABBITMQ_PORT
const RABBITMQ_USER=process.env.RABBITMQ_USER
const RABBITMQ_VHOST=process.env.RABBITMQ_VHOST
const EXCHANGE_NAME=process.env.RABBITMQ_NOTIFICATION_EXCHANGE || "io.opencrafts.veribroke-notifications"
const SHEREHE_ROUTING_KEY=process.env.SHEREHE_ROUTING_KEY || "NDOVUKUU"

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

      try {
       const {
  request_id = null,
  success = false,
  message = null,
  metadata = null
} = payload || {};

const stkCallback = metadata?.Body ?? null;

const MerchantRequestID = stkCallback?.MerchantRequestID ?? null;
const CheckoutRequestID = stkCallback?.CheckoutRequestID ?? null;

let status = "FAILED";

if (success === true) {
  status = "SUCCESS";
} else if (message === "Request Cancelled by user") {
  status = "CANCELLED";
}

const failure_reason = success === true ? null : message;

const transaction = await updateTransactionRepository(
  request_id,
  {
    checkout_request_id: CheckoutRequestID,
    merchant_request_id: MerchantRequestID,
    status,
    failure_reason,
    provider_response: stkCallback
  }
);

if (!transaction) return;

const {
  user_id = null,
  event_id = null,
  ticket_id = null,
  ticket_quantity = null
} = transaction;

if (user_id && event_id && ticket_id && ticket_quantity) {
  await createAttendeeRepository({
    user_id,
    event_id,
    ticket_id,
    ticket_quantity
  });
}


        channel.ack(msg);
      } catch (error) {
        if (msg.fields.redelivered) {
      channel.ack(msg);
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

