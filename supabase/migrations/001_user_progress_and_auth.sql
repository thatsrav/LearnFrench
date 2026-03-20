-- FrenchLearn / French Scorer — Supabase schema
-- Run in Supabase SQL Editor (Dashboard → SQL) or via supabase db push

-- Profiles (mirror auth user for display)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  display_name text,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- Lesson / unit progress (matches app SQLite user_progress + web syllabus unit ids)
create table if not exists public.user_unit_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  unit_id text not null,
  status text not null check (status in ('locked', 'available', 'completed')),
  score integer not null default 0,
  updated_at timestamptz not null default now(),
  unique (user_id, unit_id)
);

create index if not exists user_unit_progress_user_id_idx on public.user_unit_progress (user_id);

alter table public.user_unit_progress enable row level security;

create policy "uup_select_own" on public.user_unit_progress
  for select using (auth.uid() = user_id);

create policy "uup_insert_own" on public.user_unit_progress
  for insert with check (auth.uid() = user_id);

create policy "uup_update_own" on public.user_unit_progress
  for update using (auth.uid() = user_id);

create policy "uup_delete_own" on public.user_unit_progress
  for delete using (auth.uid() = user_id);

-- AI scorer history (optional cloud backup)
create table if not exists public.user_score_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  ts bigint not null,
  score integer not null,
  cecr text,
  provider text,
  created_at timestamptz not null default now()
);

create index if not exists user_score_events_user_id_idx on public.user_score_events (user_id);

alter table public.user_score_events enable row level security;

create policy "use_select_own" on public.user_score_events
  for select using (auth.uid() = user_id);

create policy "use_insert_own" on public.user_score_events
  for insert with check (auth.uid() = user_id);

create policy "use_delete_own" on public.user_score_events
  for delete using (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user ()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do update set email = excluded.email, updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user ();
