-- Migration: add contact_email, timestamps, alerts metadata, attempts table, and RLS policies
-- Run this from your Supabase SQL editor or with psql against your Supabase DB.

create extension if not exists pgcrypto;

create table if not exists profiles (
  id uuid primary key,
  name text,
  phone text,
  email text,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

create table if not exists emergency_contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  contact_name text,
  contact_phone text,
  contact_email text,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

create table if not exists alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  latitude float,
  longitude float,
  accuracy_m float,
  captured_at timestamp,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

create table if not exists emergency_notification_attempts (
  id uuid primary key default gen_random_uuid(),
  alert_id uuid references alerts(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  contact_id uuid references emergency_contacts(id) on delete set null,
  channel text not null,
  destination text not null,
  provider text not null,
  status text not null,
  provider_message_id text,
  error_message text,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Trigger function to update `updated_at`
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_updated_at_profiles on profiles;
create trigger set_updated_at_profiles
before update on profiles
for each row execute function set_updated_at();

drop trigger if exists set_updated_at_emergency_contacts on emergency_contacts;
create trigger set_updated_at_emergency_contacts
before update on emergency_contacts
for each row execute function set_updated_at();

drop trigger if exists set_updated_at_alerts on alerts;
create trigger set_updated_at_alerts
before update on alerts
for each row execute function set_updated_at();

drop trigger if exists set_updated_at_emergency_notification_attempts on emergency_notification_attempts;
create trigger set_updated_at_emergency_notification_attempts
before update on emergency_notification_attempts
for each row execute function set_updated_at();

-- Enable Row Level Security and add policies allowing users to operate on their own rows
alter table profiles enable row level security;
alter table emergency_contacts enable row level security;
alter table alerts enable row level security;
alter table emergency_notification_attempts enable row level security;

drop policy if exists "profiles_select_own" on profiles;
create policy "profiles_select_own"
on profiles for select
using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on profiles;
create policy "profiles_insert_own"
on profiles for insert
with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on profiles;
create policy "profiles_update_own"
on profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "contacts_select_own" on emergency_contacts;
create policy "contacts_select_own"
on emergency_contacts for select
using (auth.uid() = user_id);

drop policy if exists "contacts_insert_own" on emergency_contacts;
create policy "contacts_insert_own"
on emergency_contacts for insert
with check (auth.uid() = user_id);

drop policy if exists "contacts_update_own" on emergency_contacts;
create policy "contacts_update_own"
on emergency_contacts for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "contacts_delete_own" on emergency_contacts;
create policy "contacts_delete_own"
on emergency_contacts for delete
using (auth.uid() = user_id);

drop policy if exists "alerts_select_own" on alerts;
create policy "alerts_select_own"
on alerts for select
using (auth.uid() = user_id);

drop policy if exists "alerts_insert_own" on alerts;
create policy "alerts_insert_own"
on alerts for insert
with check (auth.uid() = user_id);

drop policy if exists "attempts_select_own" on emergency_notification_attempts;
create policy "attempts_select_own"
on emergency_notification_attempts for select
using (auth.uid() = user_id);

drop policy if exists "attempts_insert_own" on emergency_notification_attempts;
create policy "attempts_insert_own"
on emergency_notification_attempts for insert
with check (auth.uid() = user_id);

-- Keep existing databases in sync when the base tables were created before
-- these fields existed.
alter table emergency_contacts
  add column if not exists contact_email text;

alter table profiles
  add column if not exists updated_at timestamp default now();

alter table emergency_contacts
  add column if not exists updated_at timestamp default now();

alter table alerts
  add column if not exists accuracy_m float;

alter table alerts
  add column if not exists captured_at timestamp;

alter table alerts
  add column if not exists updated_at timestamp default now();

alter table emergency_notification_attempts
  add column if not exists updated_at timestamp default now();
