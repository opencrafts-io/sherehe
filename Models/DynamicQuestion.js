// models/DynamicQuestion.js
import { DataTypes } from 'sequelize';
import sequelize from '../Utils/db.js';

const DynamicQuestion = sequelize.define(
  'dynamic_questions',
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    event_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'events',
        key: 'id'
      }
    },
    question_text: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    question_type: {
      type: DataTypes.ENUM(
        'text',           // Short text
        'textarea',       // Long text
        'number',
        'email',
        'phone',
        'date',
        'time',
        'datetime',
        'select',         // Single select dropdown
        'multiselect',    // Multiple select
        'radio',          // Radio buttons
        'checkbox',       // Single checkbox (yes/no)
        'checkboxes',     // Multiple checkboxes
        'file',           // File upload
        'rating',         // Star rating
        'url'
      ),
      allowNull: false,
      defaultValue: 'text'
    },
    options: {
      type: DataTypes.JSONB,
      allowNull: true,
      // For select, multiselect, radio, checkboxes
      // Example: [{ label: 'Option 1', value: 'option_1' }, ...]
    },
    validation_rules: {
      type: DataTypes.JSONB,
      allowNull: true,
      // Example: { required: true, min: 0, max: 100, minLength: 5, maxLength: 500, pattern: '^[A-Za-z]+$' }
    },
    placeholder: {
      type: DataTypes.STRING,
      allowNull: true
    },
    help_text: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    is_required: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    display_order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    // When to ask the question
    ask_timing: {
      type: DataTypes.ENUM('before_registration', 'after_registration', 'after_event'),
      allowNull: false,
      defaultValue: 'before_registration'
    },
    // Conditional logic - show this question only if another question has a specific answer
    conditional_logic: {
      type: DataTypes.JSONB,
      allowNull: true,
      // Example: { depends_on_question_id: 'uuid', operator: 'equals', value: 'yes' }
    },
    is_admin_only: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    deleted_at: { type: DataTypes.DATE, allowNull: true }
  },
  {
    freezeTableName: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at',
    indexes: [
      {
        fields: ['event_id']
      },
      {
        fields: ['event_id', 'ask_timing']
      }
    ]
  }
);

export default DynamicQuestion;