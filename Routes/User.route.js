import express from "express";
import {
  createUserController,
  getUserByIdController,
  updateUserController
} from "../Controllers/User.controller.js";

const router = express.Router();
import {verifyToken} from "../Middleware/jwt_token_verification.js";

router.use(verifyToken);

router.post("/", createUserController);
router.get("/", getUserByIdController);
router.put("/:id", updateUserController);

export default router;