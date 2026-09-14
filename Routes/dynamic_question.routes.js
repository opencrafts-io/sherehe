// Routes/dynamicQuestion.routes.js
import express from "express";
import {
  getRegistrationQuestionsController,
  submitQuestionResponsesController,
  listQuestionsForAdminController,
  getQuestionsDashboardController,
  createQuestionController,
  updateQuestionController,
  toggleQuestionActiveController,
  reorderQuestionsController,
  deleteQuestionController,
  getQuestionResponsesController,
  exportResponsesCSVController
} from "../Controllers/dynamic_question.controller.js";

import { verifyToken } from "../Middleware/jwt_token_verification.js";

const router = express.Router();

router.use(verifyToken);

/**
 * ============================================
 * ATTENDEE ROUTES
 * ============================================
 */

// Get questions for a user (before/after registration/after event)
// Query: ?timing=before_registration | after_registration | after_event
router.get("/events/:eventId/questions", getRegistrationQuestionsController);

// Submit responses for questions
router.post("/events/:eventId/responses", submitQuestionResponsesController);

/**
 * ============================================
 * ADMIN ROUTES
 * ============================================
 */

// List all questions for an event (admin view with filters)
// Query: ?timing=...&is_active=true&search=...
router.get("/admin/events/:eventId/questions", listQuestionsForAdminController);

// Dashboard stats for all questions in an event
router.get("/admin/events/:eventId/dashboard", getQuestionsDashboardController);

// Create a new question
router.post("/admin/events/:eventId/questions", createQuestionController);

// Reorder questions
router.patch("/admin/events/:eventId/reorder", reorderQuestionsController);

// Update a question
router.patch("/admin/questions/:questionId", updateQuestionController);

// Toggle active state
router.patch("/admin/questions/:questionId/toggle-active", toggleQuestionActiveController);

// Soft delete a question
router.delete("/admin/questions/:questionId", deleteQuestionController);

// Get responses + aggregation for a question
// Query: ?page=1&limit=50&userId=...
router.get("/admin/questions/:questionId/responses", getQuestionResponsesController);

// Export responses as CSV
// Query: ?timing=before_registration
router.get("/admin/events/:eventId/responses/export", exportResponsesCSVController);

export default router;