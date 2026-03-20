-- Writing journal (essays, AI scores, feedback) — mirrors expo-mobile SQLite schema

create table if not exists public.writing_entries (
  id uuid primary key default gen_random_uuid (),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null default '',
  content text not null default '',
  created_at timestamptz not null default now(),
  word_count integer not null default 0,
  submitted_at timestamptz,
  draft boolean not null default true,
  category text not null default ''
);

create index if not exists writing_entries_user_created_idx
  on public.writing_entries (user_id, created_at desc);

create index if not exists writing_entries_user_submitted_idx
  on public.writing_entries (user_id, submitted_at desc);

create index if not exists writing_entries_user_category_idx
  on public.writing_entries (user_id, category);

alter table public.writing_entries enable row level security;

create policy "we_select_own" on public.writing_entries
  for select using (auth.uid() = user_id);

create policy "we_insert_own" on public.writing_entries
  for insert with check (auth.uid() = user_id);

create policy "we_update_own" on public.writing_entries
  for update using (auth.uid() = user_id);

create policy "we_delete_own" on public.writing_entries
  for delete using (auth.uid() = user_id);

-- -----------------------------------------------------------------------------

create table if not exists public.writing_scores (
  id uuid primary key default gen_random_uuid (),
  entry_id uuid not null references public.writing_entries (id) on delete cascade,
  overall_score integer not null,
  grammar_score integer not null,
  vocab_score integer not null,
  pronunciation_score integer not null,
  fluency_score integer not null,
  cecr text not null default '',
  ai_provider text not null default '',
  scored_at timestamptz not null default now()
);

create index if not exists writing_scores_entry_scored_idx
  on public.writing_scores (entry_id, scored_at desc);

create index if not exists writing_scores_scored_at_idx
  on public.writing_scores (scored_at desc);

alter table public.writing_scores enable row level security;

create policy "ws_select_own" on public.writing_scores
  for select using (
    exists (
      select 1
      from public.writing_entries e
      where e.id = writing_scores.entry_id
        and e.user_id = auth.uid()
    )
  );

create policy "ws_insert_own" on public.writing_scores
  for insert with check (
    exists (
      select 1
      from public.writing_entries e
      where e.id = writing_scores.entry_id
        and e.user_id = auth.uid()
    )
  );

create policy "ws_delete_own" on public.writing_scores
  for delete using (
    exists (
      select 1
      from public.writing_entries e
      where e.id = writing_scores.entry_id
        and e.user_id = auth.uid()
    )
  );

-- -----------------------------------------------------------------------------

create table if not exists public.writing_feedback (
  id uuid primary key default gen_random_uuid (),
  score_id uuid not null references public.writing_scores (id) on delete cascade,
  feedback_text text not null default '',
  error_examples jsonb not null default '[]'::jsonb,
  suggestions jsonb not null default '[]'::jsonb
);

create index if not exists writing_feedback_score_idx
  on public.writing_feedback (score_id);

alter table public.writing_feedback enable row level security;

create policy "wf_select_own" on public.writing_feedback
  for select using (
    exists (
      select 1
      from public.writing_scores s
      join public.writing_entries e on e.id = s.entry_id
      where s.id = writing_feedback.score_id
        and e.user_id = auth.uid()
    )
  );

create policy "wf_insert_own" on public.writing_feedback
  for insert with check (
    exists (
      select 1
      from public.writing_scores s
      join public.writing_entries e on e.id = s.entry_id
      where s.id = writing_feedback.score_id
        and e.user_id = auth.uid()
    )
  );

create policy "wf_delete_own" on public.writing_feedback
  for delete using (
    exists (
      select 1
      from public.writing_scores s
      join public.writing_entries e on e.id = s.entry_id
      where s.id = writing_feedback.score_id
        and e.user_id = auth.uid()
    )
  );
