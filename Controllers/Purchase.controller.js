import { getTicketByIdRepository } from '../Repositories/Ticket.repository.js';
import { getEventByIdRepository } from '../Repositories/Event.repository.js';
import { randomUUID } from 'crypto';
import { logs } from '../Utils/logs.js';
import { getUserByIdRepository } from '../Repositories/User.repository.js';
import { sendPaymentRequest } from '../Middleware/Veribroke_sdk_push.js';
import { createTransactionRepository, getTransactionByIdRepository } from '../Repositories/Transactions.repository.js';
import { getPaymentInfoByEventIdRepository } from '../Repositories/paymentInfo.repository.js';

const generateSheId = () => `she_${randomUUID()}`;

const SHEREHE_ROUTING_KEY = process.env.SHEREHE_ROUTING_KEY || "NDOVUKUU";

export const purchaseTicketController = async (req, res) => {
  const start = process.hrtime.bigint();

  try {
    const user_id = req.user?.sub;
    const ticket_quantity = req.body.ticket_quantity;
    const user_phone = req.body.user_phone;
    const ticket_id = req.body.ticket_id;

    console.log(user_id);

    // Missing fields
    if (!user_id || !ticket_quantity || !ticket_id) {
      const duration = Number(process.hrtime.bigint() - start) / 1000;
      logs(duration, "WARN", req.ip, req.method, "Missing required fields", req.path, 400, req.headers["user-agent"]);
      return res.status(400).json({ message: "Missing required fields" });
    }

    const ticket = await getTicketByIdRepository(ticket_id);

    if (!ticket) {
      const duration = Number(process.hrtime.bigint() - start) / 1000;
      logs(duration, "WARN", req.ip, req.method, "Ticket not found", req.path, 404, req.headers["user-agent"]);
      return res.status(404).json({ message: "Ticket not found" });
    }

    // Check quantity
    if (ticket_quantity > ticket.ticket_quantity) {
      const duration = Number(process.hrtime.bigint() - start) / 1000;
      logs(duration, "WARN", req.ip, req.method, "Not enough tickets available", req.path, 400, req.headers["user-agent"]);
      return res.status(400).json({ message: "Not enough tickets available" });
    }

    const event_id = ticket.event_id;
    const event = await getEventByIdRepository(event_id);

    const user = await getUserByIdRepository(user_id);

    if (!event) {
      const duration = Number(process.hrtime.bigint() - start) / 1000;
      logs(duration, "WARN", req.ip, req.method, "Event not found", req.path, 404, req.headers["user-agent"]);
      return res.status(404).json({ message: "Event not found" });
    }

    let phoneNumber = req.body.user_phone ?? user.phone;

    // 2️⃣ If still missing, reject
    if (!phoneNumber) {
      const duration = Number(process.hrtime.bigint() - start) / 1000;
      logs(
        duration,
        "WARN",
        req.ip,
        req.method,
        "User phone number is required",
        req.path,
        400,
        req.headers["user-agent"]
      );
      return res.status(400).json({ message: "User phone number is required" });
    }
    phoneNumber = phoneNumber.toString().trim();

    if (phoneNumber.startsWith("0")) {
      phoneNumber = "254" + phoneNumber.slice(1);
    } else if (phoneNumber.startsWith("+")) {
      phoneNumber = phoneNumber.slice(1);
    }
    // const create transaction
    const transaction = await createTransactionRepository({
      user_id,
      event_id,
      ticket_id,
      amount: ticket_quantity * ticket.ticket_price,
      ticket_quantity,
      payment_method: 'MPESA',
      phone_number: phoneNumber,
    });

    const paymentInfo = await getPaymentInfoByEventIdRepository(event_id)
    if (!paymentInfo) {
      const duration = Number(process.hrtime.bigint() - start) / 1000;
      logs(duration, "WARN", req.ip, req.method, "Payment info not found", req.path, 404, req.headers["user-agent"]);
      return res.status(404).json({ message: "Payment info not found" });
    }

    let type;
    let recipient;
    let account_reference = null
    const amount = ticket_quantity * ticket.ticket_price


    if (paymentInfo.payment_type === "MPESA_PAYBILL") {
      type = "paybill"
      recipient = paymentInfo.paybill_number
      account_reference = paymentInfo.paybill_account_number
    } else if (paymentInfo.payment_type === "MPESA_TILL") {
      type = "till"
      recipient = paymentInfo.till_number
    } else if (paymentInfo.payment_type === "MPESA_SEND_MONEY") {
      type = "personal"
      recipient = paymentInfo.phone_number
    } else if (paymentInfo.payment_type === "POSHI_LA_BIASHARA") {
      type = "poshi"
      recipient = paymentInfo.phone_number
    }

    

    const paymentData = {
      "request_id": transaction.id,
      "phone_number": phoneNumber,
      "target_user_id": user_id,
      "trans_amount": amount,
      "service_name": "SHERHE",
      "trans_desc": `Ticket purchase for ${ticket_quantity} ticket(s) to ${event.event_name}`,
      "reply_to": SHEREHE_ROUTING_KEY,
      "split_data": {
        "originator": "MPESA",
        "extras": {
          "type": type,
          "amount": 0.05 * amount,
          "recipient": recipient,
          "account_reference": account_reference,
          "occassion": "Service fee split"
        },
      },
    }

    console.log(paymentData)

    try{
      await sendPaymentRequest(paymentData);
    }catch (error) {
      const duration = Number(process.hrtime.bigint() - start) / 1000;
      logs(duration, "ERR", req.ip, req.method, error.message, req.path, 500, req.headers["user-agent"]);
      return res.status(500).json({ message: error.message });
    }

    const duration = Number(process.hrtime.bigint() - start) / 1000;
    logs(duration, "INFO", req.ip, req.method, "Sdk request sent", req.path, 201, req.headers["user-agent"]);

    res.status(200).json({
      message: "Sdk request sent successfully",
      trans_id: transaction.id
    });
  } catch (error) {
    const duration = Number(process.hrtime.bigint() - start) / 1000;
    logs(duration, "ERR", req.ip, req.method, error.message, req.path, 500, req.headers["user-agent"]);

    res.status(500).json({ message: error.message });
  }
};


export const verifyPaymentController = async (req, res) => {
  const start = process.hrtime.bigint();

  try {
    const user_id = req.user?.sub;
    const trans_id = req.params.id;

    // Validate required fields
    if (!user_id || !trans_id) {
      const duration = Number(process.hrtime.bigint() - start) / 1000;
      logs(
        duration,
        "WARN",
        req.ip,
        req.method,
        "Missing required fields",
        req.path,
        400,
        req.headers["user-agent"]
      );
      return res.status(400).json({ message: "Missing required fields" });
    }

    const transaction =
      await getTransactionByIdRepository(trans_id);

    if (!transaction) {
      const duration = Number(process.hrtime.bigint() - start) / 1000;
      logs(
        duration,
        "WARN",
        req.ip,
        req.method,
        "Transaction not found",
        req.path,
        404,
        req.headers["user-agent"]
      );
      return res.status(404).json({ message: "Transaction not found" });
    }

    // ✅ Successful verification
    const duration = Number(process.hrtime.bigint() - start) / 1000;
    logs(
      duration,
      "INFO",
      req.ip,
      req.method,
      `Transaction status: ${transaction.status}`,
      req.path,
      200,
      req.headers["user-agent"]
    );

    return res.status(200).json({
      status: transaction.status,
    });
  } catch (error) {
    const duration = Number(process.hrtime.bigint() - start) / 1000;
    logs(
      duration,
      "ERR",
      req.ip,
      req.method,
      error.message,
      req.path,
      500,
      req.headers["user-agent"]
    );

    return res.status(500).json({ message: error.message });
  }
};
