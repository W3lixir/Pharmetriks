-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║ 0003 — cloud sync storage for the "Offline + Online Sync" add-on          ║
-- ║                                                                          ║
-- ║ One row per (user, collection). The client mirrors each localStorage     ║
-- ║ collection (inventory / sales / expenses) here and merges on pull.       ║
-- ║   items       — the collection's records (array)                         ║
-- ║   tombstones  — { recordId: deletedAtISO } so deletes propagate          ║
-- ║   version     — bumped on each push for optimistic concurrency           ║
-- ║                                                                          ║
-- ║ Entitlement (the cloud_sync feature flag) is enforced in the /api/sync   ║
-- ║ route, not here. RLS only scopes rows to their owner.                    ║
-- ║                                                                          ║
-- ║ Apply via: Supabase Dashboard → SQL Editor → paste this file → run.      ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

create table if not exists public.user_data (
  user_id     uuid not null references auth.users(id) on delete cascade,
  collection  text not null check (collection in ('inv','sales','exp')),
  items       jsonb not null default '[]'::jsonb,
  tombstones  jsonb not null default '{}'::jsonb,
  version     bigint not null default 0,
  updated_at  timestamptz not null default now(),
  primary key (user_id, collection)
);

alter table public.user_data enable row level security;

-- A user may read and write ONLY their own rows.
drop policy if exists "user_data_select_own" on public.user_data;
create policy "user_data_select_own"
  on public.user_data for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "user_data_insert_own" on public.user_data;
create policy "user_data_insert_own"
  on public.user_data for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "user_data_update_own" on public.user_data;
create policy "user_data_update_own"
  on public.user_data for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
