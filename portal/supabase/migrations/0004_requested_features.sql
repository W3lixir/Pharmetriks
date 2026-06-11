-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║ 0004 — user-selected add-on requests (checkout selection)                ║
-- ║                                                                          ║
-- ║ Adds profiles.requested_features: a jsonb map the USER may write — the   ║
-- ║ add-ons they picked (and paid for) at checkout on /upload-receipt.       ║
-- ║ profiles.features stays admin-only (still pinned by the policy below);   ║
-- ║ on approval the admin/server copies requested → granted.                 ║
-- ║                                                                          ║
-- ║ Apply via: Supabase Dashboard → SQL Editor → paste this file → run.      ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

-- 1. The request column. Same shape as features: {"utang_tracker": true}.
alter table public.profiles
  add column if not exists requested_features jsonb not null default '{}'::jsonb;

-- Guard against garbage shapes/sizes (ADD CONSTRAINT has no IF NOT EXISTS):
alter table public.profiles drop constraint if exists profiles_requested_features_shape;
alter table public.profiles
  add constraint profiles_requested_features_shape
  check (jsonb_typeof(requested_features) = 'object'
         and pg_column_size(requested_features) < 2048);

-- 2. Recreate the self-update policy with the SAME six pinned columns as 0002.
--    requested_features is DELIBERATELY NOT pinned — users must be able to
--    save their own checkout selection. (This policy is a blocklist-by-pinning:
--    any future profiles column is user-writable until added here.)
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
    and features            is not distinct from (select features            from public.profiles p where p.id = auth.uid())
    and notes               is not distinct from (select notes               from public.profiles p where p.id = auth.uid())
  );

-- 3. (Defensive) The feature_3..feature_10 placeholder keys were renamed to
--    semantic keys in lib/features.ts. Check no account still carries them:
--      select email, features from public.profiles
--      where features ?| array['feature_3','feature_4','feature_5','feature_6',
--                              'feature_7','feature_8','feature_9','feature_10'];
--    If any rows show up, remap manually before relying on the new keys.
