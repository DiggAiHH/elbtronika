-- Migration: Add 'investor' role to profiles
-- Used for Pitch-Dashboard gating

-- If profiles.role is an enum, we may need to alter it.
-- For text columns, a check constraint update is safer.

alter table if exists profiles
  drop constraint if exists profiles_role_check;

alter table if exists profiles
  add constraint profiles_role_check
  check (role in ('user', 'artist', 'dj', 'curator', 'admin', 'investor'));
