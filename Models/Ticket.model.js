import { DataTypes } from 'sequelize';
import sequelize from '../Utils/db.js';


const Ticket = sequelize.define('Ticket', {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  event_id: { type: DataTypes.UUID, allowNull: false },
  ticket_name: { type: DataTypes.STRING, allowNull: true },
  ticket_price: { type: DataTypes.FLOAT, allowNull: false },
  ticket_quantity: { type: DataTypes.INTEGER, allowNull: false },
  created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  delete_tag: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
}, 
  {
    indexes: [
      {
        unique: true,
        fields: ['event_id', 'ticket_name']
      }
    ]
  }
);

export default Ticket;
