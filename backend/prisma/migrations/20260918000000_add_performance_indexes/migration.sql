-- Performance indexes: createdAt on Booking and Payment (used in date-range queries
-- for monthly chart and recent-bookings count), updatedAt on Conversation (ORDER BY
-- for inbox listings), createdAt on Provider and Service (default ORDER BY),
-- composite (conversationId, isRead) on Message (used in markMessagesRead WHERE).

CREATE INDEX IF NOT EXISTS "bookings_created_at_idx"      ON "bookings"      ("created_at");
CREATE INDEX IF NOT EXISTS "payments_created_at_idx"      ON "payments"      ("created_at");
CREATE INDEX IF NOT EXISTS "providers_created_at_idx"     ON "providers"     ("created_at");
CREATE INDEX IF NOT EXISTS "services_created_at_idx"      ON "services"      ("created_at");
CREATE INDEX IF NOT EXISTS "conversations_updated_at_idx" ON "conversations"  ("updated_at");
CREATE INDEX IF NOT EXISTS "messages_conv_read_idx"       ON "messages"       ("conversation_id", "is_read");
