import { DataTypes } from 'sequelize';
import sequelize from '../Utils/db.js';

const User = sequelize.define('User', {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  username: { type: DataTypes.STRING, unique: true, allowNull: true },
  email: { type: DataTypes.STRING, unique: true, validate: { isEmail: true } },
  name: DataTypes.STRING,
  phone: DataTypes.STRING,
});

export default User;
