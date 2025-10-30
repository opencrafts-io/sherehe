// sync.js
import { sequelize } from './db';
import { User } from '../Models/User.model.js';

async function syncDB() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected...');
    
    await sequelize.sync({ force: true }); // force:true drops & recreates tables
    console.log('✅ Models synced...');
  } catch (err) {
    console.error('❌ Error syncing DB:', err);
  } finally {
    await sequelize.close();
  }
}

syncDB();
