import { DataTypes } from 'sequelize';
import sequelize from '../Utils/db.js';


const Event = sequelize.define('Event', {
  id: { type: DataTypes.UUID, primaryKey: true , defaultValue: DataTypes.UUIDV4 },
  event_name: { type: DataTypes.STRING, allowNull: false },
  event_description: { type: DataTypes.STRING, allowNull: false },
  event_location: { type: DataTypes.STRING, allowNull: false },
  event_date: { type: DataTypes.DATE, allowNull: false },
  organizer_id: { type: DataTypes.UUID, allowNull: false},
  event_card_image: { type: DataTypes.STRING, allowNull: true },
  event_poster_image: { type: DataTypes.STRING, allowNull: true },
  event_banner_image : { type: DataTypes.STRING, allowNull: true },
  event_url: { type: DataTypes.STRING, allowNull: true },
  event_genre: { type: DataTypes.STRING, allowNull: true }, 
  created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  delete_tag: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
}, 
  {
    indexes: [
      {
        unique: true,
        fields: ['id' , 'organizer_id']
      }
    ]
  }
  ,
  {
  defaultScope: {
    attributes: { exclude: ['delete_tag'] }
  },
  scopes: {
    delete_tag: {
      attributes: { include: ['delete_tag'] }
    }
  }
}
);

export default Event;
