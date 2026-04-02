import { DataTypes } from 'sequelize';
import sequelize from '../Utils/db.js';

const ScannedTickets = sequelize.define(
  'scanned_tickets',
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    attendee_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    scanner_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    event_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    ticket_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    ticket_quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    updated_at: { type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW},
    deleted_at: { type: DataTypes.DATE, allowNull: true }
  },
  {
    timestamps: true, 
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at',
    freezeTableName: true,
    defaultScope: {
      attributes: { exclude: ['created_at', 'updated_at', 'deleted_at'] }
    },
    scopes: {
      withDeleted: {
        attributes: { include: ['deleted_at'] }
      }
    },
    indexes: [
      {
        unique: true,
        fields: ['event_id', 'attendee_id', 'ticket_id']
      }
    ]
  }
);

export default ScannedTickets;
