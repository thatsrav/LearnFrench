-- Optional: sync study level for Word of the Day / cross-device preferences (values: A1–C2)
alter table public.profiles add column if not exists study_cefr text;

comment on column public.profiles.study_cefr is 'User-chosen CEFR band for level-matched content (e.g. Word of the Day).';
