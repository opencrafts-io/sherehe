# Sherehe System Documentation

## Overview

Sherehe is an event management system that handles event creation, ticket sales, attendee management, payment processing, and ticket scanning. The system integrates with RabbitMQ for event-driven communication and payment processing.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           SHEREHE SYSTEM                            │
├─────────────┬─────────────┬─────────────┬───────────────────────────┤
│   Events    │   Tickets   │  Attendees  │      Scanners             │
├─────────────┼─────────────┼─────────────┼───────────────────────────┤
│   Payments  │  Invites    │Institutions │     Transactions          │
└─────────────┴─────────────┴─────────────┴───────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        RABBITMQ EXCHANGES                           │
├─────────────────────┬─────────────────────┬─────────────────────────┤
│ verisafe.events.    │ io.opencrafts.      │ io.opencrafts.          │
│ topic               │ veribroke           │ veribroke-notifications │
└─────────────────────┴─────────────────────┴─────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         EXTERNAL SERVICES                           │
├─────────────────────────┬───────────────────────────────────────────┤
│   Verisafe (User Mgmt)  │   Veribroke (Payment Gateway)             │
└─────────────────────────┴───────────────────────────────────────────┘
```

---

## Database Models

### 1. User Model (`users`)

Manages system users.

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `username` | STRING | Unique username |
| `email` | STRING | Unique email |
| `name` | STRING | User's full name |
| `phone` | STRING | Phone number |

**Features:** Paranoid (soft delete), timestamps hidden by default

### 2. Event Model (`events`)

Core event management.

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `event_name` | STRING | Name of the event |
| `event_description` | TEXT | Detailed description |
| `event_location` | STRING | Venue/location |
| `start_date` | DATE | Event start datetime |
| `end_date` | DATE | Event end datetime |
| `attendee_count` | INTEGER | Current attendee count |
| `organizer_id` | UUID | User ID of organizer |
| `event_card_image` | STRING | Card display image URL |
| `event_poster_image` | STRING | Poster image URL |
| `event_banner_image` | STRING | Banner image URL |
| `scope` | ENUM | `public`, `institution`, `private` |
| `event_genre` | JSONB | Event categories/tags |

### 3. Ticket Model (`tickets`)

Manages ticket types for events.

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `event_id` | UUID | Associated event |
| `ticket_name` | STRING | Ticket type name (e.g., "VIP", "Early Bird") |
| `ticket_price` | FLOAT | Price per ticket |
| `ticket_for` | INTEGER | Number of people per ticket (default: 1) |
| `ticket_quantity` | INTEGER | Total available quantity |
| `start_date` | DATE | Sale start date |
| `end_date` | DATE | Sale end date |
| `scope` | ENUM | `public`, `institution`, `private` |

### 4. Attendee Model (`attendees`)

Records ticket purchases and attendee information.

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Purchasing user |
| `event_id` | UUID | Associated event |
| `ticket_id` | UUID | Purchased ticket type |
| `ticket_quantity` | INTEGER | Number of tickets purchased |

**Note:** Each attendee record represents one seat/person. If `ticket_for = 2` and quantity = 3, 6 attendee records are created.

### 5. Transaction Model (`transactions`)

Tracks all payment transactions.

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | User who paid |
| `event_id` | UUID | Associated event |
| `ticket_id` | UUID | Purchased ticket |
| `ticket_quantity` | INTEGER | Quantity purchased |
| `amount` | DECIMAL | Total amount paid |
| `currency` | STRING | Default: 'KES' |
| `payment_method` | ENUM | `MPESA`, `AIRTEL`, `CARD`, `BANK` |
| `status` | ENUM | `PENDING`, `SUCCESS`, `FAILED`, `CANCELLED`, `REVERSED` |
| `checkout_request_id` | STRING | MPESA CheckoutRequestID |
| `merchant_request_id` | STRING | MPESA MerchantRequestID |
| `transaction_reference` | STRING | Unique reference |
| `phone_number` | STRING | Payer's phone number |
| `provider_response` | JSON | Raw payment provider response |
| `failure_reason` | STRING | Reason if failed |

### 6. PaymentInfo Model (`payment_infos`)

Stores payment configuration per event.

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `event_id` | UUID | Associated event (unique) |
| `payment_type` | ENUM | `MPESA_PAYBILL`, `MPESA_TILL`, `MPESA_SEND_MONEY`, `POSHI_LA_BIASHARA` |
| `paybill_number` | STRING | Paybill number |
| `paybill_account_number` | STRING | Account number |
| `till_number` | STRING | Till number |
| `phone_number` | STRING | For send money |

### 7. EventScanner Model (`event_scanners`)

Manages ticket scanning permissions.

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `event_id` | UUID | Associated event |
| `user_id` | UUID | Scanner user |
| `role` | ENUM | `SCANNER`, `SUPERVISOR` |
| `granted_by` | UUID | User who granted permission |

### 8. ScannedTickets Model (`scanned_tickets`)

Records ticket scan events for entry validation.

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `attendee_id` | UUID | Attendee being scanned |

### 9. Invite Models

#### EventInvite (`event_invites`)
Invites for private events.

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `event_id` | UUID | Associated event |
| `token` | STRING | Unique invite token |
| `expires_at` | DATE | Expiration datetime |
| `max_uses` | INTEGER | Maximum uses (default: 100) |
| `used_count` | INTEGER | Current use count |

#### TicketInvite (`ticket_invites`)
Similar structure for restricted ticket access.

### 10. Institution Models

Manages institutional access control (e.g., university-only events).

| Model | Purpose |
|-------|---------|
| `event_institutions` | Links events to institutions |
| `ticket_institutions` | Links tickets to institutions |
| `user_institutions` | Links users to institutions |

---

## Relationships

```
User ──┬── hasMany ──► Event (as organizer)
       ├── hasMany ──► Attendee
       ├── hasMany ──► Transaction
       ├── hasMany ──► EventScanner
       └── hasMany ──► UserInstitution

Event ──┬── hasMany ──► Ticket
        ├── hasMany ──► Attendee
        ├── hasOne  ──► PaymentInfo
        ├── hasMany ──► EventScanner
        ├── hasMany ──► EventInvite
        └── hasMany ──► EventInstitution

Ticket ──┬── hasMany ──► Attendee
         ├── hasMany ──► TicketInvite
         └── hasMany ──► TicketInstitution

Attendee ─── hasOne ──► ScannedTickets (scan record)
```

---

## Core Business Flows

### Flow 1: Ticket Purchase Process

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Client  │───▶│  Create  │───▶│  Send to │───▶│ Payment  │
│  Request │    │Transaction│    │Veribroke │    │ Gateway  │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
                       │                               │
                       ▼                               ▼
                 Status: PENDING                  MPESA STK Push
                                                         │
                                                         ▼
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Update  │◀───│ Consumer │◀───│ RabbitMQ │◀───│ Callback │
│ Attendees│    │Processes │    │ Notification│  │ Response │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
```

**Step-by-Step:**

1. **User initiates purchase** - Selects ticket type and quantity
2. **Transaction created** - Status: `PENDING`, ticket quantity temporarily reduced
3. **Payment request sent** - Via `sendPaymentRequest()` to Veribroke
4. **Veribroke processes** - Sends MPESA STK push to user's phone
5. **Callback received** - Veribroke sends result to RabbitMQ (`veribroke-notifications` exchange)
6. **Consumer processes** - `startMpesaSuccessConsumer()` handles the callback:
   - Updates transaction status (`SUCCESS`, `FAILED`, or `CANCELLED`)
   - If **SUCCESS**: Creates attendee records (one per person)
   - If **FAILED/CANCELLED**: Restores ticket quantity
7. **User notified** - Of purchase result

### Flow 2: User Synchronization (Verisafe Integration)

```
Verisafe ──▶ RabbitMQ ──▶ Sherehe Consumer
(User Service)  (fanout)   (startVerisafeListener)
```

**Events processed:**

| Event Type | Action |
|------------|--------|
| `user.created` | Create user in Sherehe database |
| `user.updated` | Update existing user information |

### Flow 3: Institution Connection Sync

```
Verisafe ──▶ RabbitMQ ──▶ Sherehe Consumer
(Institution) (topic)     (consumeInstitutionEvents)
```

**Events processed:**

| Event Type | Action |
|------------|--------|
| `user.institution.connected` | Create user-institution link |
| `user.institution.disconnected` | Remove user-institution link |

### Flow 4: Event Access Control

```
┌─────────────────────────────────────────────────────────────────┐
│                    EVENT SCOPE VALIDATION                       │
├─────────────────┬─────────────────┬─────────────────────────────┤
│    PUBLIC       │   INSTITUTION    │         PRIVATE             │
├─────────────────┼─────────────────┼─────────────────────────────┤
│ Anyone can view │ Only users from  │ Only invited users          │
│ and purchase    │ linked institu-  │ (EventInvite token)         │
│                 │ tions can access │ can access                  │
└─────────────────┴─────────────────┴─────────────────────────────┘
```

### Flow 5: Ticket Scanning

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ Scanner  │───▶│ Verify   │───▶│ Check if │───▶│ Create   │
│ App      │    │ Attendee │    │ Already  │    │ Scan     │
│          │    │ Exists   │    │ Scanned  │    │ Record   │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
                                    │
                                    ▼
                              ┌──────────┐
                              │  Reject  │
                              │Duplicate │
                              │  Entry   │
                              └──────────┘
```

---


## RabbitMQ Configuration

### Exchanges

| Exchange Name | Type | Purpose |
|---------------|------|---------|
| `verisafe.events.topic` | topic | User & institution events from Verisafe |
| `io.opencrafts.veribroke` | direct | Payment requests to Veribroke |
| `io.opencrafts.veribroke-notifications` | topic | Payment callbacks from Veribroke |

### Queues & Bindings

| Queue | Exchange | Routing Key | Consumer |
|-------|----------|-------------|----------|
| (auto-generated) | `verisafe.events.topic` | `user.institution.*` | `consumeInstitutionEvents` |
| `sherehe_mpesa_success_queue` | `io.opencrafts.veribroke-notifications` | `NDOVUKUU` | `startMpesaSuccessConsumer` |
| (defined by V_QUEUE_NAME) | fanout exchange | - | `startVerisafeListener` |

### Message Format Examples

**Verisafe User Event:**
```json
{
  "meta": {
    "source_service_id": "io.opencrafts.verisafe",
    "event_type": "user.created",
    "request_id": "uuid"
  },
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "john_doe",
    "name": "John Doe",
    "phone": "+254700000000"
  }
}
```

**Verisafe Institution Event:**
```json
{
  "meta": {
    "source_service_id": "io.opencrafts.verisafe",
    "event_type": "user.institution.connected",
    "request_id": "uuid"
  },
  "institution_connection": {
    "account_id": "user-uuid",
    "institution_id": 123
  }
}
```

**Veribroke Payment Callback:**
```json
{
  "request_id": "transaction-uuid",
  "success": true,
  "message": "Payment successful",
  "metadata": {
    "Body": {
      "stkCallback": {
        "MerchantRequestID": "merchant-id",
        "CheckoutRequestID": "checkout-id",
        "ResultCode": 0,
        "ResultDesc": "Success"
      }
    }
  }
}
```

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `RABBITMQ_HOST` | RabbitMQ server host |
| `RABBITMQ_PORT` | RabbitMQ port |
| `RABBITMQ_USER` | RabbitMQ username |
| `RABBITMQ_PASSWORD` | RabbitMQ password |
| `RABBITMQ_VHOST` | RabbitMQ virtual host |
| `EXCHANGE_NAME` | Default exchange (Veribroke) |
| `ROUTING_KEY` | Default routing key |
| `RABBITMQ_NOTIFICATION_EXCHANGE` | Notification exchange |
| `SHEREHE_ROUTING_KEY` | Sherehe routing key |
| `V_QUEUE_NAME` | Verisafe queue name |
| `V_EXCHANGE_NAME` | Verisafe exchange name |
| `V_ROUTING_KEY` | Verisafe routing key |

---

## Error Handling

### Transaction Rollback Strategy
- Database transactions wrap purchase operations
- On failure: rollback attendee creation, restore ticket quantities
- Failed payment: ticket quantity restored

### Message Acknowledgment
- **Success**: `channel.ack(msg)`
- **Recoverable error**: `channel.nack(msg, false, true)` (requeue)
- **Non-recoverable/redelivered**: `channel.ack(msg)` (prevent infinite loop)

### Soft Delete (Paranoid Mode)
All models support soft deletion with `deleted_at` timestamp. Use `scope: 'withDeleted'` to include deleted records.

---

## Security Considerations

1. **Authentication required for**:
   - Event creation/management
   - Ticket purchase
   - Scanning operations

2. **Authorization rules**:
   - Only event organizers can add scanners
   - Scanners can only scan their assigned events
   - Supervisors have broader permissions

3. **Scope validation**:
   - Institution-scoped events check user's institution membership
   - Private events require valid invite token

4. **Idempotency**:
   - Transaction references prevent duplicate payments
   - Unique constraints prevent duplicate scans per attendee

---

## Database Indexes

| Model | Index Fields | Purpose |
|-------|--------------|---------|
| Event | `(id, organizer_id)` | Fast event lookup by organizer |
| Ticket | `(event_id, ticket_name)` | Ticket search by event |
| Attendee | (implicit via indexes file) | User/event lookups |
| Transaction | `(user_id, ticket_id)` | Transaction history |
| EventScanner | `(event_id, user_id)` | Unique scanner assignment |
| EventInvite | `(id, token)` | Unique invite tokens |
| ScannedTickets | `(attendee_id, created_at)` | Prevent duplicate scans |

---

## Logging

The `logs()` utility captures:
- Duration (microseconds)
- Log level (INFO/ERR)
- Source IP
- Event type
- Message
- Request ID
- Status code
- Additional metadata
