import User from './User.model.js';
import Event from './Event.model.js';
import Ticket from './Ticket.model.js';
import Attendee from './Attendee.model.js';
import PaymentInfo from './paymentInfo.model.js';
import Transaction from './Transactions.model.js';
import EventScanner from './eventScanners.model.js';

// Define relationships
// User.hasMany(Event, { foreignKey: 'organizer_id' });
// Event.belongsTo(User, { foreignKey: 'organizer_id' });

Event.hasMany(Ticket, { foreignKey: 'event_id' });
Ticket.belongsTo(Event, { foreignKey: 'event_id' });

Event.hasMany(Attendee, { foreignKey: 'event_id' });
Attendee.belongsTo(Event, { foreignKey: 'event_id' , as: 'event' });

User.hasMany(Attendee, { foreignKey: 'user_id' });
Attendee.belongsTo(User, { foreignKey: 'user_id' });

Ticket.hasMany(Attendee, { foreignKey: 'ticket_id' });
Attendee.belongsTo(Ticket, { foreignKey: 'ticket_id' , as: 'ticket' });

Event.hasOne(PaymentInfo, { foreignKey: "event_id"});
PaymentInfo.belongsTo(Event, { foreignKey: "event_id"});

Transaction.belongsTo(User, { foreignKey: 'user_id' });
Transaction.belongsTo(Ticket, { foreignKey: 'ticket_id' });
Transaction.belongsTo(Event, { foreignKey: 'event_id' });


Event.hasMany(EventScanner, {
  foreignKey: "event_id",
});

EventScanner.belongsTo(Event, {
  foreignKey: "event_id",
});

User.hasMany(EventScanner, {
  foreignKey: "user_id",
});

EventScanner.belongsTo(User, {
  foreignKey: "user_id",
});



export { User, Event, Ticket, Attendee , PaymentInfo , Transaction , EventScanner};