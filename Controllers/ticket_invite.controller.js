import { 
  validateInviteRepository, 
  } from "../Repositories/ticket_invite.repository.js";

import { logs } from "../Utils/logs.js"; 

export const validateTicketInviteController = async (req, res) => {
  const start = process.hrtime.bigint();

  try {
    const  token = req.params.token

    if (!token) {
      const duration = Number(process.hrtime.bigint() - start) / 1000;
      logs(duration, "WARN", req.ip, req.method, "Missing token", req.path, 400, req.headers["user-agent"]);
      return res.status(400).json({ error: "Wrong Ticket Invite" });
    }

    const Ticket = await validateInviteRepository(token);

    const duration = Number(process.hrtime.bigint() - start) / 1000;
    logs(duration, "INFO", req.ip, req.method, "Ticket invite validated", req.path, 200, req.headers["user-agent"]);

    res.status(200).json({
      message: "Ticket invite validated successfully",
      Ticket,
    });
  } catch (error) {
    const duration = Number(process.hrtime.bigint() - start) / 1000;
    logs(duration, "ERR", req.ip, req.method, error.message, req.path, 500, req.headers["user-agent"]);
    if(error.message === "Invite expired" || error.message === "Invite limit reached" || error.message === "Invalid invite"){
      return res.status(400).json({ error: error.message });
    }else{
      return res.status(500).json({ error: error.message });
    }
  }
}