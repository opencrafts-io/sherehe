import { DataTypes } from 'sequelize';
import sequelize from '../Utils/db.js';

const TicketInvite = sequelize.define("ticket_invites", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },

  ticket_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },

  token: {
    type: DataTypes.STRING,
    unique: true,
  },

  expires_at: {
    type: DataTypes.DATE,
  },

  max_uses: {
    type: DataTypes.INTEGER,
    defaultValue: 100,
  },

  used_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
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
      attributes: { exclude: ['deleted_at'] }
    },
    scopes: {
      withDeleted: {
        attributes: { include: ['deleted_at' ] }
      },
    },
    indexes: [
      {
        unique: true,
        fields: ['id', 'token']
      }
    ]
  }
);

export default TicketInvite;
