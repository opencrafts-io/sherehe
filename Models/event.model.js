import { DataTypes } from 'sequelize';
import sequelize from '../Utils/db.js';

const Event = sequelize.define(
  'events',
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    event_name: { type: DataTypes.STRING, allowNull: false },
    event_description: { type: DataTypes.STRING, allowNull: false },
    event_location: { type: DataTypes.STRING, allowNull: false },
    event_date: { type: DataTypes.DATE, allowNull: false },
    attendee_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    organizer_id: { type: DataTypes.UUID, allowNull: false },
    event_card_image: { type: DataTypes.STRING, allowNull: true },
    event_poster_image: { type: DataTypes.STRING, allowNull: true },
    event_banner_image: { type: DataTypes.STRING, allowNull: true },
    scope: {
    type: DataTypes.ENUM("public", "institution", "private"),
    defaultValue: "public",
  },
    event_genre: { type: DataTypes.JSONB, allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    deleted_at: { type: DataTypes.DATE, allowNull: true }
  },
  {
    freezeTableName: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at',
    defaultScope: {
      attributes: { exclude: ['deleted_at' , 'event_visibility' , 'scope'] }
    },
    scopes: {
      withDeleted: {
        attributes: { include: ['deleted_at' ] }
      },
      withVisibility: {
        attributes: { include: ['event_visibility' ] }
      },
      withScope: {
        attributes: { include: ['scope' ] }
      }
    },
    indexes: [
      {
        unique: true,
        fields: ['id', 'organizer_id']
      }
    ]
  }
);

export default Event;
