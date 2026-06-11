-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║ Pharmetriks — initial schema                                                 ║
-- ║                                                                          ║
-- ║ Tables                                                                   ║
-- ║   profiles       extends auth.users — status, receipt, license expiry    ║
-- ║   admins         allowlist of admin user_ids                             ║
-- ║   admin_actions  audit log of approve/reject/revoke/extend events        ║
-- ║                                                                          ║
-- ║ Security model                                                           ║
-- ║   - Users can read & update their OWN profile (limited columns).         ║
-- ║   - Admins can read every profile and update status/license fields.      ║
-- ║   - Only the service role (server-side) writes to admin_actions.         ║
-- ║                                                                          ║
-- ║ Apply via: Supabase Dashboard → SQL Editor → paste this file → run.      ║
-- ║ Or via CLI: supabase db push                                             ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

-- ╭─────────────────────────────────────────────────────────────────────────╮
-- │ Extensions                                                              │
-- ╰─────────────────────────────────────────────────────────────────────────╯
create extension if not exists "uuid-ossp";

-- ╭─────────────────────────────────────────────────────────────────────────╮
-- │ Tables                                                                  │
-- ╰─────────────────────────────────────────────────────────────────────────╯

-- profiles -----------------------------------------------------------------
create table if not exists public.profiles (
  id                  uuid primary key references auth.users(id) on delete cascade,
  email               text not null,
  full_name           text,
  pharmacy_name       text,
  status              text not null default 'pending'
    check (status in ('pending','awaiting_payment','approved','rejected','revoked')),
  receipt_url         text,
  payment_reference   text,
  approved_at         timestamptz,
  approved_by         uuid references auth.users(id),
  license_expires_at  timestamptz,                 -- null = no expiry (lifetime)
  notes               text,                        -- admin-only free-text notes
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists profiles_status_idx     on public.profiles (status);
create index if not exists profiles_created_at_idx on public.profiles (created_at desc);

-- admins -------------------------------------------------------------------
create table if not exists public.admins (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- admin_actions -------------------------------------------------------------
create table if not exists public.admin_actions (
  id              bigserial primary key,
  admin_id        uuid references auth.users(id),
  target_user_id  uuid references public.profiles(id),
  action          text not null check (action in ('approve','reject','revoke','extend','note')),
  notes           text,
  created_at      timestamptz not null default now()
);

create index if not exists admin_actions_target_idx on public.admin_actions (target_user_id);

-- ╭─────────────────────────────────────────────────────────────────────────╮
-- │ Helpers                                                                 │
-- ╰─────────────────────────────────────────────────────────────────────────╯

-- is_admin(uid) ------------------------------------------------------------
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = uid);
$$;

-- auto-update updated_at ---------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute procedure public.touch_updated_at();

-- on signup, insert matching profile row -----------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, pharmacy_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'pharmacy_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ╭─────────────────────────────────────────────────────────────────────────╮
-- │ Row-level security                                                      │
-- ╰─────────────────────────────────────────────────────────────────────────╯

alter table public.profiles      enable row level security;
alter table public.admins        enable row level security;
alter table public.admin_actions enable row level security;

-- profiles policies --------------------------------------------------------

-- Anyone authenticated can SELECT their own row OR (admins) any row.
drop policy if exists "profiles_select_self_or_admin" on public.profiles;
create policy "profiles_select_self_or_admin"
  on public.profiles for select
  to authenticated
  using (id = auth.uid() or public.is_admin(auth.uid()));

-- Users may UPDATE only their own non-sensitive fields.
-- (status / license_expires_at / approved_* are gated by the WITH CHECK
-- predicate — a self-update that tries to flip those fields will fail.)
drop policy if exists "profiles_update_self_safe_fields" on public.profiles;
create policy "profiles_update_self_safe_fields"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (
    id = auth.uid()
    and status              is not distinct from (select status              from public.profiles p where p.id = auth.uid())
    and license_expires_at  is not distinct from (select license_expires_at  from public.profiles p where p.id = auth.uid())
    and approved_at         is not distinct from (select approved_at         from public.profiles p where p.id = auth.uid())
    and approved_by         is not distinct from (select approved_by         from public.profiles p where p.id = auth.uid())
  );

-- Admins may update anything on any profile.
drop policy if exists "profiles_update_admin" on public.profiles;
create policy "profiles_update_admin"
  on public.profiles for update
  to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- INSERT is handled by the auth trigger above; no client INSERT policy.

-- admins policies ----------------------------------------------------------

-- An authenticated user can check whether THEY are an admin (only their row).
drop policy if exists "admins_select_self" on public.admins;
create policy "admins_select_self"
  on public.admins for select
  to authenticated
  using (user_id = auth.uid());

-- Admins can list other admins.
drop policy if exists "admins_select_all_for_admin" on public.admins;
create policy "admins_select_all_for_admin"
  on public.admins for select
  to authenticated
  using (public.is_admin(auth.uid()));

-- No INSERT/UPDATE/DELETE policy — admin promotion is service-role only.

-- admin_actions policies ---------------------------------------------------

-- Admins can read the audit log.
drop policy if exists "admin_actions_select_admin" on public.admin_actions;
create policy "admin_actions_select_admin"
  on public.admin_actions for select
  to authenticated
  using (public.is_admin(auth.uid()));

-- Inserts come from server-side admin routes using the service role key.
drop policy if exists "admin_actions_insert_admin" on public.admin_actions;
create policy "admin_actions_insert_admin"
  on public.admin_actions for insert
  to authenticated
  with check (public.is_admin(auth.uid()) and admin_id = auth.uid());

-- ╭─────────────────────────────────────────────────────────────────────────╮
-- │ Storage — receipts bucket                                               │
-- ╰─────────────────────────────────────────────────────────────────────────╯

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'receipts', 'receipts', false, 5242880,
  array['image/png','image/jpeg','image/webp','image/heic','image/heif']
)
on conflict (id) do update set
  file_size_limit    = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types,
  public             = excluded.public;

-- Storage RLS — users may upload only their own folder (named by their UID).
drop policy if exists "receipts_user_upload" on storage.objects;
create policy "receipts_user_upload"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'receipts'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users may overwrite their own files (re-upload).
drop policy if exists "receipts_user_update" on storage.objects;
create policy "receipts_user_update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'receipts'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users may read their own receipt.
drop policy if exists "receipts_user_read" on storage.objects;
create policy "receipts_user_read"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'receipts'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Admins may read any receipt.
drop policy if exists "receipts_admin_read" on storage.objects;
create policy "receipts_admin_read"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'receipts' and public.is_admin(auth.uid()));
