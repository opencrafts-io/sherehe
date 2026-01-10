import express from "express";
import { purchaseTicketController , verifyPaymentController } from "../Controllers/Purchase.controller.js";

const router = express.Router();

import {verifyToken} from "../Middleware/jwt_token_verification.js";
router.use(verifyToken);

router.post("/", purchaseTicketController);
router.get("/:id", verifyPaymentController);

export default router;