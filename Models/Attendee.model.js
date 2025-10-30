import { DataTypes } from 'sequelize';
import sequelize from '../Utils/db.js';

const Attendee = sequelize.define('Attendee', {
  id: { 
    type: DataTypes.UUID, 
    primaryKey: true, 
    defaultValue: DataTypes.UUIDV4 
  },
  user_id: { 
    type: DataTypes.UUID, 
    allowNull: false 
  },
  event_id: { 
    type: DataTypes.UUID, 
    allowNull: false 
  },
  delete_tag: { 
    type: DataTypes.BOOLEAN, 
    allowNull: false, 
    defaultValue: false 
  }
}, {
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'event_id']
    }
  ]
});

export default Attendee;
