-- Zero Trust event: database schema for Supabase Postgres.
-- Applied by `npm run db:setup` (or paste it into the Supabase SQL Editor).
-- Safe to run more than once.
--
-- Security model: the Express server connects directly to Postgres as the
-- database owner, so it isn't affected by Row Level Security. RLS is still
-- turned ON with NO policies so Supabase's public REST API (the anon and
-- authenticated roles) can't read or write these tables at all.

-- ---------------------------------------------------------------------------
-- Registrations
-- ---------------------------------------------------------------------------
create table if not exists public.registrations (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),

  full_name     text not null check (char_length(full_name) between 2 and 80),
  email         text not null check (char_length(email) between 3 and 254),
  in_game_name  text not null check (char_length(in_game_name) between 1 and 10),
  discord       text check (discord is null or char_length(discord) between 2 and 37),
  platform      text not null check (platform in ('pc', 'mobile', 'console')),
  experience    text not null check (experience in ('new', 'casual', 'regular', 'competitive')),
  play_with     text check (play_with is null or char_length(play_with) <= 120),
  notes         text check (notes is null or char_length(notes) <= 500),

  status        text not null default 'pending'
                check (status in ('pending', 'accepted', 'rejected')),
  admin_note    text check (admin_note is null or char_length(admin_note) <= 500),
  reviewed_at   timestamptz,
  reviewed_by   text
);

-- One registration per email address (case-insensitive).
create unique index if not exists registrations_email_unique
  on public.registrations (lower(email));

create index if not exists registrations_status_created_idx
  on public.registrations (status, created_at desc);

alter table public.registrations enable row level security;
revoke all on public.registrations from anon, authenticated;

-- ---------------------------------------------------------------------------
-- Admins (created with: npm run create-admin -- <username>)
-- ---------------------------------------------------------------------------
create table if not exists public.admins (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),
  username       text not null unique check (char_length(username) between 3 and 40),
  password_hash  text not null
);

alter table public.admins enable row level security;
revoke all on public.admins from anon, authenticated;
