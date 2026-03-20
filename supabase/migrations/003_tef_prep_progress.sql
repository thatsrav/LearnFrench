-- Local mobile app mirrors this in SQLite `tef_prep_progress`; optional cloud sync later.

create table if not exists public.tef_prep_progress (
  id uuid primary key default gen_random_uuid (),
  user_id uuid not null references auth.users (id) on delete cascade,
  tef_unit integer not null,
  skill text not null check (skill in ('listening', 'reading', 'writing', 'speaking')),
  listening_catalog_id text not null default '',
  score_percent integer not null,
  correct_count integer not null,
  total_questions integer not null,
  answers_json jsonb not null default '[]'::jsonb,
  time_spent_ms integer not null default 0,
  cefr_estimate text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists tef_prep_progress_user_created_idx
  on public.tef_prep_progress (user_id, created_at desc);

alter table public.tef_prep_progress enable row level security;

create policy "tef_prep_select_own" on public.tef_prep_progress
  for select using (auth.uid() = user_id);

create policy "tef_prep_insert_own" on public.tef_prep_progress
  for insert with check (auth.uid() = user_id);

create policy "tef_prep_delete_own" on public.tef_prep_progress
  for delete using (auth.uid() = user_id);
