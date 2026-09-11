# Specification Conflicts Register

This document tracks discrepancies between the Software Design Specification (SDS) and implementation decisions. All conflicts must be reviewed and resolved before production deployment.

---

## Conflict 1 — Number of Database Tables

**Status:** Open — awaiting clarification

**Description:**
The SDS states the system has **18 database tables**, but the explicit domain table list documents only **17 tables**:

| # | Table | Domain |
|---|-------|--------|
| 1 | `users` | Identity |
| 2 | `refresh_sessions` | Identity |
| 3 | `email_verifications` | Identity |
| 4 | `traveler_profiles` | Identity |
| 5 | `providers` | Catalog |
| 6 | `services` | Catalog |
| 7 | `provider_documents` | Catalog |
| 8 | `destinations` | Catalog |
| 9 | `bookings` | Booking |
| 10 | `booking_events` | Booking |
| 11 | `payments` | Payments |
| 12 | `refunds` | Payments |
| 13 | `webhook_events` | Payments |
| 14 | `conversations` | Messaging |
| 15 | `messages` | Messaging |
| 16 | `reviews` | Moderation |
| 17 | `audit_logs` | Audit |

**Decision:** We implement exactly the 17 documented tables. No eighteenth table has been invented. Infrastructure concerns (idempotency cache, queue metadata) use Redis, not a disguised domain table.

**Action required:** Client/architect to clarify whether the 18-table count is a documentation error or if a table was omitted from the domain list.

---

## Conflict 2 — Provider Verification State: `changes_requested`

**Status:** Open — awaiting clarification

**Description:**
The `provider_status` enum is explicitly documented as:

```
draft, submitted, under_review, approved, listed, suspended, rejected
```

However, the provider verification workflow section references a `changes_requested` state that is **not included** in the enum definition.

**Decision:** The Prisma schema implements only the documented enum values. The provider verification state machine is isolated in configuration so that adding `changes_requested` requires only:
1. A new Prisma migration adding the enum value
2. A state-machine config update

No business logic will break if this value is added later.

**Action required:** Confirm whether `changes_requested` should be added to the `provider_status` enum.

---

## Conflict 3 — Refund Initiation Authority

**Status:** Open — awaiting clarification

**Description:**
The SDS contains conflicting descriptions of who can initiate refunds:

- **Section A** describes traveler cancellation automatically triggering a Stripe refund
- **Section B** describes concierge and admin users manually initiating refunds

These are not mutually exclusive, but the refund orchestration must handle both paths:
1. Automatic refund triggered by a booking state transition (e.g., `cancelled_by_traveler`)
2. Manual refund initiated by concierge/admin via API

**Decision:** The refund service is designed to accept refund requests from both paths. The refund module is decoupled from the booking state machine so that:
- Booking cancellation can *optionally* trigger a refund
- Concierge/admin can initiate refunds independently
- The final business rules can be applied without restructuring

**Action required:** Confirm the complete set of refund initiation scenarios and their authorization rules.

---

*Last updated: Phase 1 initial implementation*
