-- Enable required PostgreSQL extensions for Salone Travel
-- This runs automatically on first database initialization via Docker

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "citext";
CREATE EXTENSION IF NOT EXISTS "postgis";
