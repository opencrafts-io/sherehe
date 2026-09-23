// Controllers/dynamicQuestion.controller.js
import {
  createQuestionRepository,
  bulkCreateQuestionsRepository,
  getRegistrationQuestionsRepository,
  listQuestionsForAdminRepository,
  getQuestionsDashboardRepository,
  getQuestionByIdRepository,
  updateQuestionRepository,
  toggleQuestionActiveRepository,
  reorderQuestionsRepository,
  deleteQuestionRepository,
  bulkCreateResponsesRepository,
  getQuestionResponsesRepository,
  getQuestionValuesRepository,
  // getEventResponsesForExportRepository,
  validateResponseValue
} from "../Repositories/dynamic_questions.repository.js";

import sequelize from "../Utils/db.js";
import { logs } from "../Utils/logs.js";
import { Parser } from "json2csv";

/**
 * ============================================
 * ATTENDEE ENDPOINTS
 * ============================================
 */

/**
 * Get registration questions for a user (before/after registration/after event)
 */
export const getRegistrationQuestionsController = async (req, res) => {
  const start = process.hrtime.bigint();

  try {
    const { eventId } = req.params;
    const timing = req.query.timing || "before_registration";

    const validTimings = ["before_registration", "after_registration", "after_event"];
    if (!validTimings.includes(timing)) {
      const duration = Number(process.hrtime.bigint() - start);
      logs(duration, "WARN", req.ip, req.method, "Invalid timing param", req.originalUrl, 400, req.headers["user-agent"]);
      return res.status(400).json({ error: "Invalid timing value" });
    }

    const questions = await getRegistrationQuestionsRepository(eventId, timing);

    const duration = Number(process.hrtime.bigint() - start);
    logs(duration, "INFO", req.ip, req.method, "Fetched registration questions", req.originalUrl, 200, req.headers["user-agent"]);

    return res.status(200).json({
      count: questions.length,
      data: questions
    });
  } catch (error) {
    const duration = Number(process.hrtime.bigint() - start);
    logs(duration, "ERROR", req.ip, req.method, error.message, req.originalUrl, 500, req.headers["user-agent"]);
    return res.status(500).json({
      error: "Failed to fetch registration questions",
      details: error.message
    });
  }
};

/**
 * Submit responses for a set of questions
 */
export const submitQuestionResponsesController = async (req, res) => {
  const start = process.hrtime.bigint();
  let transaction;
  const fail = (status, message) => {
    const duration = Number(process.hrtime.bigint() - start);
    logs(duration, status >= 500 ? "ERROR" : "WARN", req.ip, req.method,
         message, req.originalUrl, status, req.headers["user-agent"]);
    return res.status(status).json({ error: message });
  };

  try {
    const { responses } = req.body;
    const { eventId } = req.params;
    const userId = req.user.sub;

    if (!eventId || !Array.isArray(responses) || responses.length === 0) {
      return fail(422, "eventId and responses array are required");
    }

    // 0. Reject duplicate question_ids in the same payload
    const questionIds = responses.map(r => r.question_id);
    if (new Set(questionIds).size !== questionIds.length) {
      return fail(422, "Duplicate question_id in payload");
    }

    transaction = await sequelize.transaction();

    try {
      // 1. Load the questions, scoped to THIS event and marked usable
      const questions = await DynamicQuestion.findAll({
        where: {
          id: { [Op.in]: questionIds },
          event_id: eventId,
          is_active: true,
          is_deleted: false,
          visibility: { [Op.in]: ["public", "attendee"] } // adjust to schema
        },
        transaction,
        lock: transaction.LOCK.UPDATE
      });

      // 2. Every submitted question must have been found & belong to eventId
      if (questions.length !== questionIds.length) {
        const found = new Set(questions.map(q => q.id));
        const missing = questionIds.filter(id => !found.has(id));
        await transaction.rollback();
        return fail(422, `Invalid or inaccessible question_id(s): ${missing.join(", ")}`);
      }

      const questionById = new Map(questions.map(q => [q.id, q]));

      // 3. Validate registration_id ownership (if provided)
      const regIds = [...new Set(responses.map(r => r.registration_id).filter(Boolean))];
      if (regIds.length) {
        const owned = await Registration.findAll({
          where: { id: { [Op.in]: regIds }, user_id: userId, event_id: eventId },
          attributes: ["id"],
          transaction
        });
        const ownedSet = new Set(owned.map(r => r.id));
        const bad = regIds.filter(id => !ownedSet.has(id));
        if (bad.length) {
          await transaction.rollback();
          return fail(403, `registration_id not owned by user for this event: ${bad.join(", ")}`);
        }
      }

      // 4. Load existing responses to satisfy conditional logic & uniqueness
      const existing = await QuestionResponse.findAll({
        where: { event_id: eventId, user_id: userId },
        transaction
      });
      const responseByQuestionId = new Map(existing.map(r => [r.question_id, r]));

      // 5. Per-question value validation + conditional logic
      for (const r of responses) {
        const q = questionById.get(r.question_id);

        if (responseByQuestionId.has(q.id) && q.allow_multiple !== true) {
          await transaction.rollback();
          return fail(409, `Question ${q.id} already answered`);
        }

        if (!conditionMet(q, responseByQuestionId)) {
          await transaction.rollback();
          return fail(422, `Question ${q.id} is not currently applicable`);
        }

        const err = validateResponseValue(q, r.response_value);
        if (err) {
          await transaction.rollback();
          return fail(422, `Invalid response for question ${q.id}: ${err}`);
        }
      }

      // 6. Insert
      const responsesToCreate = responses.map(r => ({
        question_id: r.question_id,
        event_id: eventId,
        user_id: userId,
        registration_id: r.registration_id || null,
        response_value: r.response_value
      }));

      await bulkCreateResponsesRepository(responsesToCreate, { transaction });
      await transaction.commit();
    } catch (error) {
      if (transaction && !transaction.finished) await transaction.rollback();
      throw error;
    }

    const duration = Number(process.hrtime.bigint() - start);
    logs(duration, "INFO", req.ip, req.method, "Responses submitted",
         req.originalUrl, 201, req.headers["user-agent"]);
    return res.status(201).json({ message: "Responses submitted successfully" });
  } catch (error) {
    return fail(500, `Failed to submit responses: ${error.message}`);
  }
};

/**
 * ============================================
 * ADMIN ENDPOINTS
 * ============================================
 */

/**
 * List all questions for an event (admin view)
 */
export const listQuestionsForAdminController = async (req, res) => {
  const start = process.hrtime.bigint();

  try {
    const { eventId } = req.params;
    const { timing, is_active, search } = req.query;

    const filters = {};
    if (timing) filters.timing = timing;
    if (is_active !== undefined) filters.is_active = is_active === "true";
    if (search) filters.search = search;

    const questions = await listQuestionsForAdminRepository(eventId, filters);

    const duration = Number(process.hrtime.bigint() - start);
    logs(duration, "INFO", req.ip, req.method, "Admin: listed questions", req.originalUrl, 200, req.headers["user-agent"]);

    return res.status(200).json({
      total: questions.length,
      data: questions
    });
  } catch (error) {
    const duration = Number(process.hrtime.bigint() - start);
    logs(duration, "ERROR", req.ip, req.method, error.message, req.originalUrl, 500, req.headers["user-agent"]);
    return res.status(500).json({
      error: "Failed to list questions",
      details: error.message
    });
  }
};

/**
 * Admin dashboard: questions overview for an event
 */
export const getQuestionsDashboardController = async (req, res) => {
  const start = process.hrtime.bigint();

  try {
    const { eventId } = req.params;
    const data = await getQuestionsDashboardRepository(eventId);

    if (!data) {
      const duration = Number(process.hrtime.bigint() - start);
      logs(duration, "WARN", req.ip, req.method, "Event not found", req.originalUrl, 404, req.headers["user-agent"]);
      return res.status(404).json({ error: "Event not found" });
    }

    const duration = Number(process.hrtime.bigint() - start);
    logs(duration, "INFO", req.ip, req.method, "Admin: questions dashboard", req.originalUrl, 200, req.headers["user-agent"]);

    return res.status(200).json(data);
  } catch (error) {
    const duration = Number(process.hrtime.bigint() - start);
    logs(duration, "ERROR", req.ip, req.method, error.message, req.originalUrl, 500, req.headers["user-agent"]);
    return res.status(500).json({
      error: "Failed to load dashboard",
      details: error.message
    });
  }
};

/**
 * Create a single question for an event
 */
export const createQuestionController = async (req, res) => {
  const start = process.hrtime.bigint();

  try {
    const { eventId } = req.params;
    const adminId = req.user.sub;

    const {question_text ,
      question_type , 
      options, 
      validation_rules, 
      is_required, 
      ask_timing, 
      display_order , 
      help_text , 
      is_active , 
      conditional_logic , 
      is_admin_only} = req.body;

    const payload = {
      question_type , 
      options, 
      validation_rules, 
      is_required, 
      ask_timing, 
      display_order , 
      help_text , 
      is_active , 
      conditional_logic , 
      is_admin_only,
      question_text,
      event_id: eventId,
    };

    const question = await createQuestionRepository(payload);

    const duration = Number(process.hrtime.bigint() - start);
    logs(duration, "INFO", req.ip, req.method, "Admin: created question", req.originalUrl, 201, req.headers["user-agent"]);

    return res.status(201).json({
      message: "Question created successfully",
      data: question
    });
  } catch (error) {
    const duration = Number(process.hrtime.bigint() - start);
    logs(duration, "ERROR", req.ip, req.method, error.message, req.originalUrl, 500, req.headers["user-agent"]);
    return res.status(500).json({
      error: "Failed to create question",
      details: error.message
    });
  }
};

/**
 * Update a question
 */
export const updateQuestionController = async (req, res) => {
  const start = process.hrtime.bigint();

  try {
    const { questionId } = req.params;
    const adminId = req.user.sub;

        const {question_text ,
      question_type , 
      options, 
      validation_rules, 
      is_required, 
      ask_timing, 
      display_order , 
      help_text , 
      is_active , 
      conditional_logic , 
      is_admin_only} = req.body;

    const payload = {
      question_type , 
      options, 
      validation_rules, 
      is_required, 
      ask_timing, 
      display_order , 
      help_text , 
      is_active , 
      conditional_logic , 
      is_admin_only,
      question_text,
    };

    const result = await updateQuestionRepository(questionId, payload, adminId);

    if (result.status === "not_found") {
      const duration = Number(process.hrtime.bigint() - start);
      logs(duration, "WARN", req.ip, req.method, "Question not found", req.originalUrl, 404, req.headers["user-agent"]);
      return res.status(404).json({ error: "Question not found" });
    }

    const duration = Number(process.hrtime.bigint() - start);
    logs(duration, "INFO", req.ip, req.method, "Admin: updated question", req.originalUrl, 200, req.headers["user-agent"]);

    return res.status(200).json({
      message: "Question updated successfully",
      data: result.question
    });
  } catch (error) {
    const duration = Number(process.hrtime.bigint() - start);
    logs(duration, "ERROR", req.ip, req.method, error.message, req.originalUrl, 500, req.headers["user-agent"]);
    return res.status(500).json({
      error: "Failed to update question",
      details: error.message
    });
  }
};

/**
 * Toggle question active state
 */
export const toggleQuestionActiveController = async (req, res) => {
  const start = process.hrtime.bigint();

  try {
    const { questionId } = req.params;
    const adminId = req.user.sub;

    const result = await toggleQuestionActiveRepository(questionId, adminId);

    if (result.status === "not_found") {
      const duration = Number(process.hrtime.bigint() - start);
      logs(duration, "WARN", req.ip, req.method, "Question not found", req.originalUrl, 404, req.headers["user-agent"]);
      return res.status(404).json({ error: "Question not found" });
    }

    const duration = Number(process.hrtime.bigint() - start);
    logs(duration, "INFO", req.ip, req.method, "Admin: toggled question", req.originalUrl, 200, req.headers["user-agent"]);

    return res.status(200).json({
      message: `Question ${result.is_active ? "activated" : "deactivated"} successfully`,
      data: { id: result.id, is_active: result.is_active }
    });
  } catch (error) {
    const duration = Number(process.hrtime.bigint() - start);
    logs(duration, "ERROR", req.ip, req.method, error.message, req.originalUrl, 500, req.headers["user-agent"]);
    return res.status(500).json({
      error: "Failed to toggle question",
      details: error.message
    });
  }
};

/**
 * Reorder questions
 */
export const reorderQuestionsController = async (req, res) => {
  const start = process.hrtime.bigint();
  let transaction;

  try {
    const { eventId } = req.params;
    const { order } = req.body;
    const adminId = req.user.sub;

    if (!Array.isArray(order) || order.length === 0) {
      const duration = Number(process.hrtime.bigint() - start);
      logs(duration, "WARN", req.ip, req.method, "Invalid reorder payload", req.originalUrl, 422, req.headers["user-agent"]);
      return res.status(422).json({ error: "order array is required" });
    }

    transaction = await sequelize.transaction();

    try {
      await reorderQuestionsRepository(eventId, order, adminId, { transaction });
      await transaction.commit();
    } catch (error) {
      if (!transaction.finished) await transaction.rollback();
      throw error;
    }

    const duration = Number(process.hrtime.bigint() - start);
    logs(duration, "INFO", req.ip, req.method, "Admin: reordered questions", req.originalUrl, 200, req.headers["user-agent"]);

    return res.status(200).json({ message: "Questions reordered successfully" });
  } catch (error) {
    const duration = Number(process.hrtime.bigint() - start);
    logs(duration, "ERROR", req.ip, req.method, error.message, req.originalUrl, 500, req.headers["user-agent"]);
    return res.status(500).json({
      error: "Failed to reorder questions",
      details: error.message
    });
  }
};

/**
 * Delete a question (soft delete)
 */
export const deleteQuestionController = async (req, res) => {
  const start = process.hrtime.bigint();

  try {
    const { questionId } = req.params;
    const result = await deleteQuestionRepository(questionId);

    if (result.status === "not_found") {
      const duration = Number(process.hrtime.bigint() - start);
      logs(duration, "WARN", req.ip, req.method, "Question not found", req.originalUrl, 404, req.headers["user-agent"]);
      return res.status(404).json({ error: "Question not found" });
    }

    const duration = Number(process.hrtime.bigint() - start);
    logs(duration, "INFO", req.ip, req.method, "Admin: deleted question", req.originalUrl, 200, req.headers["user-agent"]);

    return res.status(200).json({ message: "Question deleted successfully" });
  } catch (error) {
    const duration = Number(process.hrtime.bigint() - start);
    logs(duration, "ERROR", req.ip, req.method, error.message, req.originalUrl, 500, req.headers["user-agent"]);
    return res.status(500).json({
      error: "Failed to delete question",
      details: error.message
    });
  }
};

/**
 * Get responses for a question with aggregation
 */
export const getQuestionResponsesController = async (req, res) => {
  const start = process.hrtime.bigint();

  try {
    const { questionId } = req.params;
    const { page = 1, limit = 50, userId } = req.query;

    const question = await getQuestionByIdRepository(questionId);
    if (!question) {
      const duration = Number(process.hrtime.bigint() - start);
      logs(duration, "WARN", req.ip, req.method, "Question not found", req.originalUrl, 404, req.headers["user-agent"]);
      return res.status(404).json({ error: "Question not found" });
    }

    const pagedData = await getQuestionResponsesRepository(questionId, { page, limit, userId });
    const values = await getQuestionValuesRepository(questionId);

    // Build aggregation based on question type
    let aggregation;
    switch (question.question_type) {
      case "select":
      case "radio": {
        const counts = {};
        values.forEach(v => {
          const key = typeof v === "object" ? v?.value : v;
          if (key != null) counts[key] = (counts[key] || 0) + 1;
        });
        aggregation = {
          type: "frequency",
          data: Object.entries(counts).map(([value, count]) => ({
            value,
            count,
            percentage: ((count / values.length) * 100).toFixed(2)
          }))
        };
        break;
      }
      case "multiselect":
      case "checkboxes": {
        const counts = {};
        values.forEach(arr => {
          (arr || []).forEach(v => {
            counts[v] = (counts[v] || 0) + 1;
          });
        });
        aggregation = {
          type: "frequency",
          data: Object.entries(counts).map(([value, count]) => ({
            value,
            count,
            percentage: ((count / values.length) * 100).toFixed(2)
          }))
        };
        break;
      }
      case "rating":
      case "number": {
        const nums = values.map(v => Number(v)).filter(n => !isNaN(n));
        const sum = nums.reduce((a, b) => a + b, 0);
        aggregation = {
          type: "numeric",
          count: nums.length,
          min: nums.length ? Math.min(...nums) : 0,
          max: nums.length ? Math.max(...nums) : 0,
          average: nums.length ? (sum / nums.length).toFixed(2) : 0,
          sum
        };
        break;
      }
      case "checkbox": {
        const yes = values.filter(v => v === true || v === "true").length;
        aggregation = {
          type: "boolean",
          yes,
          no: values.length - yes,
          yes_percentage: values.length ? ((yes / values.length) * 100).toFixed(2) : 0
        };
        break;
      }
      default:
        aggregation = { type: "list", total: values.length };
    }

    const duration = Number(process.hrtime.bigint() - start);
    logs(duration, "INFO", req.ip, req.method, "Admin: question responses", req.originalUrl, 200, req.headers["user-agent"]);

    return res.status(200).json({
      question: {
        id: question.id,
        text: question.question_text,
        type: question.question_type,
        options: question.options
      },
      aggregation,
      pagination: {
        total: pagedData.total,
        page: pagedData.page,
        limit: pagedData.limit,
        totalPages: pagedData.totalPages
      },
      responses: pagedData.responses
    });
  } catch (error) {
    const duration = Number(process.hrtime.bigint() - start);
    logs(duration, "ERROR", req.ip, req.method, error.message, req.originalUrl, 500, req.headers["user-agent"]);
    return res.status(500).json({
      error: "Failed to fetch responses",
      details: error.message
    });
  }
};

/**
 * Export responses as CSV
 */
// export const exportResponsesCSVController = async (req, res) => {
//   const start = process.hrtime.bigint();

//   try {
//     const { eventId } = req.params;
//     const { timing } = req.query;

//     const { questions, responses } = await getEventResponsesForExportRepository(eventId, timing);

//     // Pivot responses: one row per user, one column per question
//     const userMap = {};
//     responses.forEach(r => {
//       if (!userMap[r.user_id]) userMap[r.user_id] = { user_id: r.user_id };
//       userMap[r.user_id][r.question_id] = r.response_value;
//     });

//     const fields = ["user_id", ...questions.map(q => q.question_text)];

//     const rows = Object.values(userMap).map(u => {
//       const row = { user_id: u.user_id };
//       questions.forEach(q => {
//         const val = u[q.id];
//         row[q.question_text] = Array.isArray(val)
//           ? val.join(", ")
//           : typeof val === "object" && val !== null
//             ? JSON.stringify(val)
//             : val ?? "";
//       });
//       return row;
//     });

//     const parser = new Parser({ fields });
//     const csv = parser.parse(rows);

//     const duration = Number(process.hrtime.bigint() - start);
//     logs(duration, "INFO", req.ip, req.method, "Admin: exported responses CSV", req.originalUrl, 200, req.headers["user-agent"]);

//     res.header("Content-Type", "text/csv");
//     res.header("Content-Disposition", `attachment; filename="event-${eventId}-responses.csv"`);
//     return res.send(csv);
//   } catch (error) {
//     const duration = Number(process.hrtime.bigint() - start);
//     logs(duration, "ERROR", req.ip, req.method, error.message, req.originalUrl, 500, req.headers["user-agent"]);
//     return res.status(500).json({
//       error: "Failed to export responses",
//       details: error.message
//     });
//   }
// };