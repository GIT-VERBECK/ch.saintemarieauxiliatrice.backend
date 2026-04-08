-- Table de préférences dashboard par utilisateur
-- Exécuter ce script dans Supabase SQL Editor.

create table if not exists public.dashboard_preferences (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  read_announcement_ids text[] not null default '{}',
  favorite_score_ids text[] not null default '{}',
  last_opened_score jsonb null,
  updated_at timestamptz not null default now()
);

alter table public.dashboard_preferences enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where tablename = 'dashboard_preferences'
      and policyname = 'dashboard_preferences_select_own'
  ) then
    create policy dashboard_preferences_select_own
      on public.dashboard_preferences
      for select
      using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1
    from pg_policies
    where tablename = 'dashboard_preferences'
      and policyname = 'dashboard_preferences_insert_own'
  ) then
    create policy dashboard_preferences_insert_own
      on public.dashboard_preferences
      for insert
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1
    from pg_policies
    where tablename = 'dashboard_preferences'
      and policyname = 'dashboard_preferences_update_own'
  ) then
    create policy dashboard_preferences_update_own
      on public.dashboard_preferences
      for update
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end $$;
