import amqp from "amqplib";
import { updateUserRepository } from "../Repositories/User.repository.js";
import { logs } from '../Utils/logs.js';
const RABBITMQ_HOST = process.env.RABBITMQ_HOST
const RABBITMQ_PASSWORD = process.env.RABBITMQ_PASSWORD
const RABBITMQ_PORT = process.env.RABBITMQ_PORT
const RABBITMQ_USER = process.env.RABBITMQ_USER
const RABBITMQ_VHOST = process.env.RABBITMQ_VHOST

// const EXCHANGE_NAME=process.env.EXCHANGE_NAME || "io.opencrafts.veribroke"

// const ROUTING_KEY=process.env.ROUTING_KEY || "veribroke.mpesa-stk"

export async function consumeInstitutionEvents() {
  const start = process.hrtime.bigint();

  try {
    // 1. Connection Configuration
    const EXCHANGE_NAME = 'verisafe.events.topic';
    const ROUTING_KEY_PATTERN = 'user.institution.*';
    const RABBITMQ_URL = `amqp://${RABBITMQ_USER}:${RABBITMQ_PASSWORD}@${RABBITMQ_HOST}:${RABBITMQ_PORT}${RABBITMQ_VHOST || '/'}`; // Update with your credentials

    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    // 2. Setup Exchange
    await channel.assertExchange(EXCHANGE_NAME, 'topic', { durable: true });

    // 3. Setup Queue (exclusive means it's deleted when the connection closes)
    const q = await channel.assertQueue('', { exclusive: true });

    // 4. Bind Queue to Exchange
    await channel.bindQueue(q.queue, EXCHANGE_NAME, ROUTING_KEY_PATTERN);

    // 5. Start Consuming
    channel.consume(q.queue, (msg) => {
      if (msg.content) {
        const rawContent = msg.content.toString();

        try {
          const data = JSON.parse(rawContent);

          // --- VALIDATION RULES ---

          // Rule 4: Source Service Check
          if (data.meta?.source_service_id !== 'io.opencrafts.verisafe') {
            console.error('[!] Rejected: Invalid Source Service');
            return channel.ack(msg);
          }

          // Rule 3: Event Type Check
          const validEvents = ['user.institution.connected', 'user.institution.disconnected'];
          if (!validEvents.includes(data.meta?.event_type)) {
            console.error('[!] Rejected: Unknown Event Type');
            return channel.ack(msg);
          }

          // Rule 2 & 5/6: Required Fields & UUID presence
          const { account_id, institution_id } = data.institution_connection || {};
          if (!account_id || !institution_id || !data.meta?.request_id) {
            console.error('[!] Rejected: Missing Required Fields');
            return channel.ack(msg);
          }

          if (data.meta.event_type === 'user.institution.connected') {
            updateUserRepository( account_id, {institution_id} );
          } else if (data.meta.event_type === 'user.institution.disconnected') {
            updateUserRepository( account_id, {institution_id: null} );
          }


          channel.ack(msg);

          const end = process.hrtime.bigint();
          const durationMicroseconds = Number(end - start) / 1000;

          logs(
            durationMicroseconds,
            "INFO",
            'rabbitmq',
            'event',
            "User Institution Connection Event Received Successfully",
            data.meta.request_id,
            201,
            data.meta.event_type
          );

        } catch (err) {
          const end = process.hrtime.bigint();
          const durationMicroseconds = Number(end - start) / 1000;
          logs(
            durationMicroseconds,
            "ERR",
            'rabbitmq',
            'event',
            "User Institution Connection Event Received Successfully",
            data.meta.request_id,
            201,
            data.meta.event_type
          );

          // Discard malformed JSON to prevent infinite loops
          channel.ack(msg);
        }
      }
    }, { noAck: false });

  } catch (error) {
    console.error('[!] RabbitMQ Connection Error:', error);
  }
}

