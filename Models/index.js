import User from './user.model.js';
import Event from './event.model.js';
import Ticket from './ticket.model.js';
import Attendee from './attendee.model.js';
import PaymentInfo from './payment_info.model.js';
import Transaction from './transactions.model.js';
import EventScanner from './event_scanners.model.js';
import EventInvite from './event_invite.model.js';
import EventInstitution from './event_institution.model.js';
import  TicketInvite from './ticket_invite.model.js';
import TicketInstitution from './ticket_institution.model.js';
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

Event.hasMany(EventInvite, {
  foreignKey: "event_id",
});

EventInvite.belongsTo(Event, {
  foreignKey: "event_id",
});

Event.hasMany(EventInstitution, {
  foreignKey: "event_id",
});

EventInstitution.belongsTo(Event, {
  foreignKey: "event_id",
});

Ticket.hasMany(TicketInvite, {
  foreignKey: "ticket_id",
});

TicketInvite.belongsTo(Ticket, {
  foreignKey: "ticket_id",
});

TicketInstitution.belongsTo(Ticket, {
  foreignKey: "ticket_id",
})

Ticket.hasMany(TicketInstitution, {
  foreignKey: "ticket_id",
});

export { User, Event, Ticket, Attendee , PaymentInfo , Transaction , EventScanner , EventInvite , EventInstitution , TicketInvite , TicketInstitution};