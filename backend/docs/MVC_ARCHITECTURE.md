# Salone Travel Concierge Platform — MVC Architecture Specification & Standards

This document establishes the official **Modular MVC + Service + Repository** architecture, request flows, coding standards, and module organization for the **Salone Travel Concierge Platform**.

---

## 1. High-Level Architectural Flow

```text
HTTP Request
     │
     ▼
Route (`<module>.routes.ts`)
     │
     ▼
Middleware (`authenticate`, `authorize`, `validate`, `rateLimit`, `idempotency`)
     │
     ▼
Controller (`<module>.controller.ts`) [Thin HTTP Adapter]
     │
     ▼
Service (`<module>.service.ts`) [Business Rules, Transactions, State Orchestration]
     │
     ▼
Repository (`<module>.repository.ts`) [Prisma Queries, Concurrency Locks, Pagination]
     │
     ▼
Model / Prisma Client (`prisma/schema.prisma`)
     │
     ▼
PostgreSQL 15 + PostGIS
```

### Response Path:
```text
PostgreSQL ──► Prisma ──► Repository ──► Service ──► Controller ──► Presenter (`<module>.presenter.ts`) ──► JSON Response
```

---

## 2. Realtime WebSocket Flow

```text
Socket.io Client Event (`chat:send`)
     │
     ▼
WebSocket Handshake / Auth Middleware (`websocket/auth.ts`)
     │
     ▼
Socket Event Handler (`websocket/handlers/chat.handler.ts`)
     │
     ▼
Service (`conversationService.sendMessage`)
     │
     ▼
Repository (`conversationRepository.createMessage`)
     │
     ▼
PostgreSQL Database (Authoritative Persistence FIRST)
     │
     ▼
Socket.io Redis Pub/Sub Broadcast (`io.to("conv:<id>").emit("chat:message")`)
```

---

## 3. Background Worker Flow

```text
BullMQ Queue Trigger
     │
     ▼
Worker Job Processor (`jobs/processors/<name>.processor.ts`)
     │
     ▼
Domain Service / Repository (`bookingRepository`, `authRepository`, `paymentService`)
     │
     ▼
Integration Provider Adapter (`stripe`, `sendgrid`, `twilio`)
```

---

## 4. Layer Responsibilities & Constraints

### A. Routes (`<module>.routes.ts`)
- **Responsibility**: HTTP method & route path mapping, middleware binding (`validate`, `authenticate`, `authorize`, `rateLimit`, `idempotency`).
- **Constraint**: Strict prohibition of business logic, Prisma queries, or data transformations in route definitions.

### B. Controllers (`<module>.controller.ts`)
- **Responsibility**: Thin HTTP translation. Reads URL parameters, query parameters, validated body, and authenticated principal (`Principal`, `RequestContext`). Invokes service methods and formats responses using Presenters (`sendSuccess`, `sendCreated`, `sendCollection`).
- **Constraint**: **Zero Prisma queries, zero business state calculations, zero direct third-party SDK calls**.

### C. Services (`<module>.service.ts`)
- **Responsibility**: Authoritative domain business logic, transactional boundaries (`prisma.$transaction`), state-machine transitions, authorization requiring resource context, and event/queue job scheduling.
- **Constraint**: **No Express `req`, `res`, `next` objects**. Accepts clean domain inputs, `Principal`, and `RequestContext`.

### D. Repositories (`<module>.repository.ts`)
- **Responsibility**: Encapsulated database operations via Prisma ORM, query filtering, pagination (`buildPaginationArgs`), optimistic concurrency checking (`version`), and batch database maintenance.
- **Constraint**: Repositories accept transaction clients (`DatabaseClient = PrismaClient | Prisma.TransactionClient`) and do not contain HTTP logic or business workflow routing.

### E. Presenters / View Layer (`<module>.presenter.ts`)
- **Responsibility**: Sanitizing and mapping domain entities into safe API DTOs.
- **Constraint**: Explicitly excludes sensitive database columns (`passwordHash`, `tokenHash`, internal flags, private reviewer notes).

### F. Policies (`<module>.policy.ts`)
- **Responsibility**: Fine-grained authorization logic based on resource ownership and principal roles (e.g. `BookingPolicy.canCancel`, `ProviderPolicy.canManageProvider`).

### G. Integrations (`src/integrations/`)
- **Responsibility**: Third-party service adapters (`stripe`, `sendgrid`, `twilio`, `storage`, `maps`, `sentry`).
- **Constraint**: Wrapped behind clean interfaces; business modules only consume the abstract provider interfaces.

---

## 5. Actual Project Directory Layout

```text
backend/
├── src/
│   ├── app.ts
│   ├── server.ts
│   ├── worker.ts
│   ├── scheduler.ts
│   │
│   ├── common/
│   │   ├── database/
│   │   │   └── transaction.ts
│   │   ├── errors/
│   │   │   ├── AppError.ts
│   │   │   └── index.ts
│   │   ├── middleware/
│   │   │   ├── authenticate.ts
│   │   │   ├── authorize.ts
│   │   │   ├── errorHandler.ts
│   │   │   ├── idempotency.ts
│   │   │   ├── rateLimiter.ts
│   │   │   ├── requestId.ts
│   │   │   └── validate.ts
│   │   ├── pagination/
│   │   ├── responses/
│   │   ├── types/
│   │   │   ├── principal.ts
│   │   │   ├── context.ts
│   │   │   └── index.ts
│   │   └── utils/
│   │
│   ├── config/
│   │   ├── constants.ts
│   │   ├── database.ts
│   │   ├── env.ts
│   │   ├── logger.ts
│   │   └── redis.ts
│   │
│   ├── domain/
│   │   ├── booking/
│   │   │   └── booking-state-machine.ts
│   │   ├── money/
│   │   │   └── commission.calculator.ts
│   │   └── provider/
│   │       └── provider-verification.engine.ts
│   │
│   ├── integrations/
│   │   ├── maps/
│   │   ├── sendgrid/
│   │   ├── sentry/
│   │   ├── storage/
│   │   ├── stripe/
│   │   │   ├── stripe.client.ts
│   │   │   ├── stripe.types.ts
│   │   │   ├── stripe-payment.provider.ts
│   │   │   └── stripe-webhook.service.ts
│   │   └── twilio/
│   │       ├── twilio-sms.provider.ts
│   │       └── twilio-whatsapp.provider.ts
│   │
│   ├── jobs/
│   │   ├── processors/
│   │   │   ├── booking.processor.ts
│   │   │   ├── maintenance.processor.ts
│   │   │   └── notification.processor.ts
│   │   ├── queues/
│   │   └── scheduled/
│   │
│   ├── modules/
│   │   ├── admin/
│   │   ├── audit/
│   │   ├── auth/
│   │   ├── bookings/
│   │   ├── conversations/
│   │   ├── destinations/
│   │   ├── messages/
│   │   ├── notifications/
│   │   ├── payments/
│   │   ├── provider-documents/
│   │   ├── providers/
│   │   ├── refunds/
│   │   ├── reviews/
│   │   ├── services/
│   │   └── users/
│   │
│   ├── routes/
│   │   └── v1.ts
│   │
│   └── websocket/
│       ├── auth.ts
│       ├── redis-adapter.ts
│       ├── rooms.ts
│       ├── server.ts
│       └── handlers/
│           └── chat.handler.ts
│
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
│
├── tests/
└── docs/
```

---

## 6. Architecture Audit Report

### A. Direct Prisma Access Outside Repositories/Data Infrastructure
- **Business Controllers**: `0`
- **Route Handlers**: `0`
- **WebSocket Handlers**: `0`

### B. Direct Third-Party SDK Access Outside Integrations
- **Controllers**: `0`
- **Route Handlers**: `0`
- **Repositories**: `0`
- **Services**: All third-party services consume `PaymentProvider`, `EmailProvider`, `SmsProvider`, or `WhatsAppProvider` interfaces.
