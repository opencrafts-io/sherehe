// models/QuestionResponse.js
import { DataTypes } from 'sequelize';
import sequelize from '../Utils/db.js';

const QuestionResponse = sequelize.define(
  'question_responses',
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    question_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'dynamic_questions',
        key: 'id'
      }
    },
    event_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'events',
        key: 'id'
      }
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false
      // references: { model: 'users', key: 'id' }
    },
    registration_id: {
      type: DataTypes.UUID,
      allowNull: true
      // references: { model: 'registrations', key: 'id' }
    },
    response_value: {
      type: DataTypes.JSONB,
      allowNull: true
      // Can store string, number, array (for multiselect), etc.
    },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  },
  {
    freezeTableName: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['question_id', 'user_id', 'event_id']
      }
    ]
  }
);

export default QuestionResponse;