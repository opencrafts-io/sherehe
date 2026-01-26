import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import sequelize from './Utils/db.js';
import path from 'path';
const PORT = process.env.PORT || 3001;
import './Models/index.js';
import { startVerisafeListener } from './Services/verisafe.js';
import {startMpesaSuccessConsumer} from './Middleware/Veribroke_sdk_recieve.js';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.get("/", (req, res) => {
  res.send("Hello World!")
})

import eventRouter from './Routes/Event.route.js'
import ticketRouter from './Routes/Ticket.route.js'
import attendeeRouter from './Routes/Attendee.route.js'
import userRouter from './Routes/User.route.js'
import purchaseTicket from './Routes/Purchase.route.js'
import eventScanners from './Routes/eventScanners.route.js'

app.use('/event', eventRouter)
app.use('/ticket', ticketRouter)
app.use('/attendee', attendeeRouter)
app.use('/user', userRouter)
app.use('/purchase', purchaseTicket)
app.use('/eventscanner', eventScanners)


app.listen(PORT, async () => {
  try {
    await sequelize.authenticate();

    await sequelize.sync({ alter: true });
    console.log("✅ Models synced...");
    // startVerisafeListener();
    await startMpesaSuccessConsumer();
    // Start Verisafe
    await startVerisafeListener();
    console.log(`🚀 Server running on port ${PORT}`);
  } catch (error) {
    console.error("❌ Database error:", error);
  }
});
