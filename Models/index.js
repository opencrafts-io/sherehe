import User from './User.model.js';
import Event from './Event.model.js';
import Ticket from './Ticket.model.js';
import Attendee from './Attendee.model.js';

// Define relationships
User.hasMany(Event, { foreignKey: 'organizer_id' });
Event.belongsTo(User, { foreignKey: 'organizer_id' });

Event.hasMany(Ticket, { foreignKey: 'event_id' });
Ticket.belongsTo(Event, { foreignKey: 'event_id' });

Event.hasMany(Attendee, { foreignKey: 'event_id' });
Attendee.belongsTo(Event, { foreignKey: 'event_id' });

User.hasMany(Attendee, { foreignKey: 'user_id' });
Attendee.belongsTo(User, { foreignKey: 'user_id' });


export { User, Event, Ticket, Attendee };