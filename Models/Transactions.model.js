import { DataTypes } from 'sequelize';
import sequelize from '../Utils/db.js';

const Transaction = sequelize.define(
  'transactions',
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },

    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    event_id: {
      type: DataTypes.UUID,
      allowNull: true, // allow non-event payments in future
    },

    ticket_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },

    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    currency: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'KES',
    },

    /** PAYMENT METHOD */
    payment_method: {
      type: DataTypes.ENUM('MPESA', 'AIRTEL', 'CARD', 'BANK'),
      allowNull: false,
      defaultValue: 'MPESA',
    },

    /** TRANSACTION STATUS */
    status: {
      type: DataTypes.ENUM(
        'PENDING',
        'SUCCESS',
        'FAILED',
        'CANCELLED',
        'REVERSED'
      ),
      allowNull: false,
      defaultValue: 'PENDING',
    },

    /** EXTERNAL REFERENCES */
    checkout_request_id: {
      type: DataTypes.STRING,
      allowNull: true, // MPESA CheckoutRequestID
    },

    merchant_request_id: {
      type: DataTypes.STRING,
      allowNull: true, // MPESA MerchantRequestID
    },

    transaction_reference: {
      unique: true,
      type: DataTypes.STRING,
      allowNull: true,
    },

    phone_number: {
      type: DataTypes.STRING,
      allowNull: true, // mainly for mobile money
    },

    /** RAW PROVIDER RESPONSE (CALLBACKS, ERRORS) */
    provider_response: {
      type: DataTypes.JSON,
      allowNull: true,
    },

    /** FAILURE REASON */
    failure_reason: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },

    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },

    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at',

    defaultScope: {
      attributes: { exclude: ['deleted_at'] },
    },

    scopes: {
      withDeleted: {
        attributes: { include: ['deleted_at'] },
      },
    },

    indexes: [
      {
        fields: ['user_id', 'ticket_id']
      }
    ]
  }
);

export default Transaction;
