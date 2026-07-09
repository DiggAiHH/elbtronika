-- Migration: add 'investor' to the profile_role ENUM
-- Used for Pitch-Dashboard gating (/[locale]/pitch, InvestorWelcomeModal).
--
-- REWRITTEN in Sprint 3 (2026-07-09). The original version of this file
-- added a CHECK constraint with wrong text values ('user' instead of
-- 'visitor', 'collector' missing entirely) against what is actually a
-- Postgres ENUM column — creating the constraint would have failed on
-- existing rows, and the 'investor' enum value was never added at all.
-- Safe to rewrite: no migration in this repo has ever been applied to a
-- remote environment (tracked as blocker B5 since 2026-04-30).

-- Defensive cleanup in case any environment ever received the broken version.
ALTER TABLE IF EXISTS profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

-- PG12+: ADD VALUE is allowed inside a transaction as long as the new value
-- is not used within the same transaction (we don't use it here).
ALTER TYPE profile_role ADD VALUE IF NOT EXISTS 'investor';
