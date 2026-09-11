# Salone Travel Backend — Modular MVC + Service + Repository Refactoring Plan

## 1. Executive Summary & Objective

This document specifies the architectural refactoring of the **Salone Travel Concierge Platform Backend** into a **Modular MVC + Service + Repository** pattern while preserving the modular monolith structure, database schema, HTTP API contracts, and business logic.

---

## 2. Target Architectural Flow

```text
HTTP Request
     │
     ▼
Route (`<module>.routes.ts`)
     │
     ▼
Middleware (Validation, Auth, Rate Limiting, Idempotency)
     │
     ▼
Controller (`<module>.controller.ts`) [Thin HTTP translation]
     │
     ▼
Service (`<module>.service.ts`) [Business logic, transactions, state orchestration]
     │
     ▼
Repository (`<module>.repository.ts`) [Database / Prisma persistence, queries, locks]
     │
     ▼
Prisma ORM / PostgreSQL
```

### Response Path:
```text
PostgreSQL ──► Prisma ──► Repository ──► Service ──► Controller ──► Presenter (`<module>.presenter.ts`) ──► Standard JSON Response
```

---

## 3. Module Breakdown & Standardization

Every business domain module under `src/modules/<module>/` will adhere to the standard file structure:

| File | Primary Responsibility | Anti-Patterns Forbidden |
|------|------------------------|-------------------------|
| `<module>.routes.ts` | Express HTTP method & path mapping, middleware binding | No business logic, no database calls |
| `<module>.controller.ts` | Extracts input, calls service with `Principal` & `RequestContext`, sends JSON via Presenter | No Prisma queries, no business rules, no direct third-party SDK calls |
| `<module>.service.ts` | Business validation, workflow orchestration, database transactions, domain events, queue dispatch | No Express `req`, `res`, `next` objects |
| `<module>.repository.ts` | Prisma queries, pagination, transactional queries, database aggregation | No HTTP logic, no third-party SDKs, no business state machine transitions |
| `<module>.validation.ts` | Zod schemas for input validation (body, query, params) | Format/type only; business rules live in service |
| `<module>.presenter.ts` | Maps Prisma records to clean, secure API DTOs (stripping hashes, private tokens, internal notes) | Never blindly return full database models |
| `<module>.policy.ts` | Domain resource authorization (e.g. `BookingPolicy.canCancel(principal, booking)`) | Avoid embedding complex ownership rules in generic middleware |
| `<module>.types.ts` | Domain input/output interfaces, DTOs, and configuration types | - |
| `<module>.errors.ts` | Module-specific custom errors extending `AppError` (optional where needed) | - |
| `index.ts` | Barrel export for the module | - |

---

## 4. Detailed Module Migration Mapping

### A. Common MVC Foundation (`src/common/`)
- `src/common/types/principal.ts`: Standard `Principal` (`userId`, `role`, `sessionId`).
- `src/common/types/context.ts`: Standard `RequestContext` (`requestId`, `ip`, `userAgent`).
- `src/common/database/transaction.ts`: Shared `DatabaseClient` type (`PrismaClient | Prisma.TransactionClient`).
- Presenter baseline utilities.

### B. Auth & User Domains (`src/modules/auth/`, `src/modules/users/`)
- `auth.controller.ts`, `auth.service.ts`, `auth.repository.ts`, `auth.routes.ts`, `auth.validation.ts`, `auth.presenter.ts`, `auth.types.ts`.
- `users.controller.ts`, `users.service.ts`, `users.repository.ts`, `users.presenter.ts`.

### C. Catalog & Discovery Domains
- **Destinations**: `destination.controller.ts`, `destination.service.ts`, `destination.repository.ts`, `destination.routes.ts`, `destination.validation.ts`, `destination.presenter.ts`.
- **Providers**: `provider.controller.ts`, `provider.service.ts`, `provider.repository.ts`, `provider.routes.ts`, `provider.validation.ts`, `provider.presenter.ts`, `provider.policy.ts`, `provider.verification.ts`.
- **Services**: `service.controller.ts`, `service.service.ts`, `service.repository.ts`, `service.routes.ts`, `service.validation.ts`, `service.presenter.ts`.
- **Provider Documents**: `provider-document.controller.ts`, `provider-document.service.ts`, `provider-document.repository.ts`, `provider-document.routes.ts`, `provider-document.validation.ts`, `provider-document.presenter.ts`.

### D. Booking Domain (`src/modules/bookings/`)
- `booking.controller.ts`, `booking.service.ts`, `booking.repository.ts`, `booking.routes.ts`, `booking.validation.ts`, `booking.presenter.ts`, `booking.policy.ts`, `booking.state-machine.ts`, `booking.events.ts`.

### E. Payments & Refunds (`src/modules/payments/`, `src/modules/refunds/`)
- `payment.controller.ts`, `payment.webhook.controller.ts`, `payment.service.ts`, `payment.repository.ts`, `payment.routes.ts`, `payment.validation.ts`, `payment.presenter.ts`.
- `refund.controller.ts`, `refund.service.ts`, `refund.repository.ts`, `refund.routes.ts`, `refund.validation.ts`, `refund.presenter.ts`, `refund.policy.ts`.

### F. Conversations, Messages & Real-Time Chat (`src/modules/conversations/`, `src/modules/messages/`, `src/websocket/`)
- `conversation.controller.ts`, `conversation.service.ts`, `conversation.repository.ts`, `conversation.routes.ts`, `conversation.validation.ts`, `conversation.presenter.ts`, `conversation.policy.ts`.
- `message.controller.ts`, `message.service.ts`, `message.repository.ts`, `message.routes.ts`, `message.validation.ts`, `message.presenter.ts`.
- WebSocket handlers calling `MessageService` directly rather than Prisma.

### G. Reviews & Moderation (`src/modules/reviews/`)
- `review.controller.ts`, `review.service.ts`, `review.repository.ts`, `review.routes.ts`, `review.validation.ts`, `review.presenter.ts`, `review.policy.ts`.

### H. Administration (`src/modules/admin/`)
- `admin.controller.ts`, `admin.service.ts`, `admin.routes.ts`, `admin.validation.ts`, `admin.presenter.ts`.

### I. Audit & Notifications (`src/modules/audit/`, `src/modules/notifications/`)
- Standardized reusable service and repository patterns.

---

## 5. Migration Execution Strategy

1. **Step-by-Step Isolation**: Refactor modules sequentially.
2. **Immediate Test Verification**: Run test suite after each module refactor (`npm test`).
3. **Zero Regression**: Strict enforcement of API routes, response shapes, error contracts, and DB schema.
4. **Code Quality**: Ensure `npm run typecheck`, `npm run lint`, and `npm test` remain 100% green at every step.
