# WebSocket Real-Time Messaging & Event Catalogue

This document defines the WebSocket real-time protocol, event catalog, authentication model, and room architecture for the **Salone Travel Concierge Platform**.

---

## 1. Architecture Overview

- **Engine**: [Socket.io](https://socket.io/) (v4) with Redis pub/sub adapter (`@socket.io/redis-adapter`) for multi-node horizontal scaling.
- **Protocol**: WebSocket with automatic HTTP long-polling fallback.
- **Persistence Principle**: **Authoritative Persistence First** — Every message is validated and persisted into PostgreSQL *before* acknowledgment to the sender and fan-out to the room.

---

## 2. Connection Handshake & Authentication

### Endpoint
`ws://<host>:<port>/socket.io/?EIO=4&transport=websocket`

### Authentication Credentials
Clients must supply a valid JWT access token using one of the following methods during handshake:

1. **`auth` object (Recommended)**:
   ```javascript
   const socket = io('https://api.salonetravel.com', {
     auth: {
       token: 'eyJhbGciOiJIUzI1Ni...'
     }
   });
   ```

2. **HTTP Authorization Header**:
   ```
   Authorization: Bearer <token>
   ```

3. **Query Parameter**:
   ```
   ?token=<token>
   ```

### Handshake Verification
- Decodes and verifies the JWT against `JWT_SIGNING_KEY`.
- Queries PostgreSQL to ensure user account exists and is not `suspended`.
- Attaches authenticated user context (`{ userId, role, email }`) directly to `socket.data.user`.
- Automatically joins default channels:
  - Personal channel: `user:<userId>`
  - Staff channel (for `concierge` and `admin` roles): `staff:concierge`

---

## 3. Room Management

All room joins are strictly authorized by the server. Sockets cannot join arbitrary rooms.

| Room Name | Access Control | Description |
|-----------|----------------|-------------|
| `conv:<conversationId>` | Participant Traveler, Assigned Concierge, Unclaimed Concierge queue, Admin | Scoped channel for real-time conversation messages, typing indicators, and read receipts. |
| `user:<userId>` | Authenticated User | Personal push channel for booking updates, payments, and system notices. |
| `staff:concierge` | Role `concierge` or `admin` | Real-time queue for new unassigned conversations, claiming updates, and emergency alerts. |

---

## 4. Client-to-Server Events (`Client -> Server`)

### `chat:join`
Joins a conversation room after server-side authorization check.
```json
// Payload
{
  "conversationId": "550e8400-e29b-41d4-a716-446655440000"
}

// Acknowledgement Callback
{
  "success": true
}
// Or failure:
{
  "success": false,
  "error": "Unauthorized to join this conversation"
}
```

### `chat:send`
Sends a message in an active conversation. The server validates, writes to PostgreSQL, acknowledges with `messageId`, then broadcasts `chat:message` to all participants.
```json
// Payload
{
  "conversationId": "550e8400-e29b-41d4-a716-446655440000",
  "content": "Hi, what time does the boat transfer depart?",
  "attachments": []
}

// Acknowledgement Callback
{
  "success": true,
  "messageId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d"
}
```

### `chat:typing`
Ephemeral typing indicator. Does NOT hit the database. Rate-limited and broadcasted to other room participants.
```json
// Payload
{
  "conversationId": "550e8400-e29b-41d4-a716-446655440000",
  "isTyping": true
}
```

### `chat:read`
Marks unread messages in the conversation as read by the caller.
```json
// Payload
{
  "conversationId": "550e8400-e29b-41d4-a716-446655440000"
}
```

---

## 5. Server-to-Client Broadcast Events (`Server -> Client`)

### `chat:message`
Broadcasted to room `conv:<conversationId>` when a new message is successfully stored in PostgreSQL.
```json
{
  "id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "conversationId": "550e8400-e29b-41d4-a716-446655440000",
  "senderId": "alex-uuid-1",
  "content": "Hi, what time does the boat transfer depart?",
  "attachments": [],
  "createdAt": "2026-11-15T09:30:00.000Z",
  "sender": {
    "id": "alex-uuid-1",
    "fullName": "Alex Traveler",
    "role": "traveler"
  }
}
```

### `chat:typing`
Broadcasted to room `conv:<conversationId>` (excluding the typing user).
```json
{
  "conversationId": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "concierge-uuid-1",
  "isTyping": true
}
```

### `chat:read`
Broadcasted to room `conv:<conversationId>` when a participant marks messages as read.
```json
{
  "conversationId": "550e8400-e29b-41d4-a716-446655440000",
  "readerId": "concierge-uuid-1",
  "readAt": "2026-11-15T09:31:00.000Z"
}
```

### `conversation:assigned`
Broadcasted to room `conv:<conversationId>` when a concierge claims or is assigned to the thread.
```json
{
  "conversationId": "550e8400-e29b-41d4-a716-446655440000",
  "conciergeId": "concierge-uuid-1"
}
```

### `conversation:released`
Broadcasted when a conversation is returned to the unclaimed concierge queue.
```json
{
  "conversationId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### `conversation:emergency`
Broadcasted to room `conv:<conversationId>` and `staff:concierge` when an emergency is escalated.
```json
{
  "conversationId": "550e8400-e29b-41d4-a716-446655440000",
  "isEmergency": true,
  "notes": "Medical assistance requested at hotel"
}
```

### `conversation:emergency_resolved`
Broadcasted when an escalated emergency is marked resolved by staff.
```json
{
  "conversationId": "550e8400-e29b-41d4-a716-446655440000",
  "isEmergency": false
}
```
