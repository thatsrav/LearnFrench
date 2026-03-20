-- Optional server-side cache for daily writing topics (Gemini-generated JSON).
-- The web app currently persists topics in localStorage; use this table when you
-- want a single canonical topic per (date, level) from a cron job or edge function.

create table if not exists public.daily_topics (
  id uuid primary key default gen_random_uuid(),
  topic_date date not null,
  cefr_level text not null check (cefr_level in ('A1', 'A2', 'B1', 'B2', 'C1')),
  payload jsonb not null,
  created_at timestamptz not null default now(),
  unique (topic_date, cefr_level)
);

create index if not exists daily_topics_date_level_idx on public.daily_topics (topic_date, cefr_level);

alter table public.daily_topics enable row level security;

-- Read published topics to any authenticated user (tune for your product)
create policy "daily_topics_select_authenticated" on public.daily_topics
  for select to authenticated using (true);

-- Inserts only via service role / admin (no client insert policy by default)

comment on table public.daily_topics is 'CEFR-dated writing prompts; optional backend for WritingService.';
