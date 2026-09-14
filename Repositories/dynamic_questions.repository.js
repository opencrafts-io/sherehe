// Repository/dynamicQuestionRepository.js
import { Event, DynamicQuestion, QuestionResponse } from '../Models/index.js';
import { Op, fn, col , literal } from 'sequelize';

/**
 * Create a question
 */
export const createQuestionRepository = async (questionData, options = {}) => {
  try {
    const question = await DynamicQuestion.create(questionData, options);
    return question.toJSON();
  } catch (error) {
    throw error;
  }
};

/**
 * Bulk create questions
 */
export const bulkCreateQuestionsRepository = async (questionsData, options = {}) => {
  try {
    const questions = await DynamicQuestion.bulkCreate(questionsData, {
      ...options,
      returning: true
    });
    return questions.map(q => q.toJSON());
  } catch (error) {
    throw error;
  }
};

/**
 * Fetch registration questions for a user (attendee view)
 */
export const getRegistrationQuestionsRepository = async (eventId, timing = 'before_registration') => {
  try {
    const questions = await DynamicQuestion.findAll({
      where: {
        event_id: eventId,
        ask_timing: timing,
        is_active: true,
        is_admin_only: false
      },
      order: [['display_order', 'ASC']]
    });

    return questions.map(q => q.toJSON());
  } catch (error) {
    throw error;
  }
};



export const listQuestionsForAdminRepository = async (eventId, filters = {}) => {
  try {
    const { timing, is_active, search } = filters;
    const where = { event_id: eventId };

    if (timing) where.ask_timing = timing;
    if (is_active !== undefined) where.is_active = is_active;
    if (search) where.question_text = { [Op.iLike]: `%${search}%` };

    const questions = await DynamicQuestion.findAll({
      where,
      order: [['ask_timing', 'ASC'], ['display_order', 'ASC']],
      attributes: {
        include: [
          [
            literal(`(
              SELECT COUNT(*)
              FROM question_responses AS qr
              WHERE qr.question_id = "dynamic_questions"."id"
            )`),
            'response_count'
          ]
        ]
      }
    });

    return questions.map(q => {
      const json = q.toJSON();
      return {
        ...json,
        response_count: Number(json.response_count) || 0
      };
    });
  } catch (error) {
    throw error;
  }
};
/**
 * Admin dashboard stats for all questions in an event
 */

export const getQuestionsDashboardRepository = async (eventId) => {
  try {
    const event = await Event.findByPk(eventId, {
      include: [
        {
          model: DynamicQuestion,               // no `as` — Sequelize uses the model name
          include: [
            {
              model: QuestionResponse,          // no `as` — Sequelize uses the model name
              attributes: ['id']
            }
          ]
        }
      ]
    });

    if (!event) return null;

    const json = event.toJSON();

    // Sequelize will expose them under the model name keys:
    //   json.dynamic_questions
    //   q.question_responses
    const questions = json.dynamic_questions || [];

    const stats = questions.map(q => {
      const responseCount = q.question_responses?.length || 0;
      return {
        id: q.id,
        text: q.question_text,
        type: q.question_type,
        timing: q.ask_timing,
        is_required: q.is_required,
        is_active: q.is_active,
        response_count: responseCount,
        response_rate: json.attendee_count
          ? ((responseCount / json.attendee_count) * 100).toFixed(1) + '%'
          : 'N/A'
      };
    });

    return {
      event_id: json.id,
      event_name: json.event_name,
      total_attendees: json.attendee_count,
      total_questions: stats.length,
      before_registration: stats.filter(s => s.timing === 'before_registration').length,
      after_registration: stats.filter(s => s.timing === 'after_registration').length,
      after_event: stats.filter(s => s.timing === 'after_event').length,
      questions: stats
    };
  } catch (error) {
    throw error;
  }
};
/**
 * Get a single question by id
 */
export const getQuestionByIdRepository = async (questionId) => {
  try {
    const question = await DynamicQuestion.findByPk(questionId);
    return question ? question.toJSON() : null;
  } catch (error) {
    throw error;
  }
};

/**
 * Update a question
 */
export const updateQuestionRepository = async (questionId, updateData, updatedBy) => {
  try {
    const question = await DynamicQuestion.findByPk(questionId);
    if (!question) return { status: 'not_found' };

    await question.update({ ...updateData, updated_by: updatedBy });
    return { status: 'success', question: question.toJSON() };
  } catch (error) {
    throw error;
  }
};

/**
 * Toggle active state
 */
export const toggleQuestionActiveRepository = async (questionId, updatedBy) => {
  try {
    const question = await DynamicQuestion.findByPk(questionId);
    if (!question) return { status: 'not_found' };

    await question.update({ is_active: !question.is_active, updated_by: updatedBy });
    return {
      status: 'success',
      id: question.id,
      is_active: question.is_active
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Reorder questions
 */
export const reorderQuestionsRepository = async (eventId, order, updatedBy, options = {}) => {
  try {
    await Promise.all(
      order.map(({ id, display_order }) =>
        DynamicQuestion.update(
          { display_order, updated_by: updatedBy },
          { where: { id, event_id: eventId }, ...options }
        )
      )
    );
    return { status: 'success' };
  } catch (error) {
    throw error;
  }
};

/**
 * Soft-delete a question
 */
export const deleteQuestionRepository = async (questionId) => {
  try {
    const question = await DynamicQuestion.findByPk(questionId);
    if (!question) return { status: 'not_found' };

    await question.destroy();
    return { status: 'success' };
  } catch (error) {
    throw error;
  }
};

/**
 * Submit responses (bulk)
 */
export const bulkCreateResponsesRepository = async (responsesData, options = {}) => {
  try {
    const responses = await QuestionResponse.bulkCreate(responsesData, options);
    return responses.map(r => r.toJSON());
  } catch (error) {
    throw error;
  }
};

/**
 * Get paginated responses for a question
 */
export const getQuestionResponsesRepository = async (questionId, { page = 1, limit = 50, userId } = {}) => {
  try {
    const offset = (page - 1) * limit;
    const where = { question_id: questionId };
    if (userId) where.user_id = userId;

    const { count, rows } = await QuestionResponse.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [['created_at', 'DESC']]
    });

    return {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / limit),
      responses: rows.map(r => ({
        id: r.id,
        user_id: r.user_id,
        response_value: r.response_value,
        submitted_at: r.created_at
      }))
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Fetch all raw values for a question (used for aggregation)
 */
export const getQuestionValuesRepository = async (questionId) => {
  try {
    const responses = await QuestionResponse.findAll({
      where: { question_id: questionId },
      attributes: ['response_value']
    });
    return responses.map(r => r.response_value);
  } catch (error) {
    throw error;
  }
};

/**
 * Get all responses for an event with included questions (for CSV export)
 */
export const getEventResponsesForExportRepository = async (eventId, timing) => {
  try {
    const questionWhere = { event_id: eventId, include_in_export: true };
    if (timing) questionWhere.ask_timing = timing;

    const questions = await DynamicQuestion.findAll({
      where: questionWhere,
      order: [['display_order', 'ASC']]
    });

    const responses = await QuestionResponse.findAll({
      where: { event_id: eventId },
      order: [['user_id', 'ASC'], ['created_at', 'ASC']]
    });

    return {
      questions: questions.map(q => q.toJSON()),
      responses: responses.map(r => r.toJSON())
    };
  } catch (error) {
    throw error;
  }
};