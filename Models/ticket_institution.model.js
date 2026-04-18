import { DataTypes } from 'sequelize';
import sequelize from '../Utils/db.js';

const TicketInstitution = sequelize.define("ticket_institutions", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },

  ticket_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },

  institution_id: {
    type: DataTypes.STRING,
    allowNull: false,
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
        fields: ['id', 'institution_id']
      }
    ]
  }
);
export default TicketInstitution;
