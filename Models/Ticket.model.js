import { DataTypes } from 'sequelize';
import sequelize from '../Utils/db.js';

const Ticket = sequelize.define(
  'tickets',
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    event_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    ticket_name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ticket_price: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    ticket_quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
     type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    }
  },
  {
    freezeTableName: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at',
    defaultScope: {
      attributes: { exclude: ['created_at', 'updated_at', 'deleted_at'] }
    },
    indexes: [
      {
        fields: ['event_id', 'ticket_name']
      }
    ]
  }
);

export default Ticket;
