import { DataTypes } from "sequelize";
import sequelize from "../Utils/db.js";

const EventScanner = sequelize.define(
  "event_scanners",
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

    user_id: {
      type: DataTypes.UUID,
      allowNull: false
    },

    role: {
      type: DataTypes.ENUM("SCANNER", "SUPERVISOR"),
      allowNull: false,
      defaultValue: "SCANNER"
    },

    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },

    granted_by: {
      type: DataTypes.UUID,
      allowNull: false,
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
      allowNull: true
    }
  },
  {
    freezeTableName: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    paranoid: true,
    deletedAt: "deleted_at",

    indexes: [
      {
        unique: true,
        fields: ["event_id", "user_id"]
      }
    ]
  }
);

export default EventScanner;
