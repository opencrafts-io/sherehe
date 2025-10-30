import express from "express";
import {
  createUserController,
  getUserByIdController,
  updateUserController
} from "../Controllers/User.controller.js";

const router = express.Router();

router.post("/", createUserController);
router.get("/:id", getUserByIdController);
router.put("/:id", updateUserController);

export default router;