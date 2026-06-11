-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║ 0002 — per-account add-on feature entitlements                           ║
-- ║                                                                          ║
-- ║ Adds profiles.features (jsonb on/off map), e.g. {"feature_1": true}.     ║
-- ║ Admin toggles them via the service role; each user can READ their own    ║
-- ║ row (existing select policy) so the app learns its entitlements.         ║
-- ║                                                                          ║
-- ║ Apply via: Supabase Dashboard → SQL Editor → paste this file → run.      ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

-- 1. The entitlements column. Absent key = feature OFF. Default: nothing on.
alter table public.profiles
  add column if not exists features jsonb not null default '{}'::jsonb;

-- 2. Security: a user may update their OWN profile (name/pharmacy), but must
--    NOT be able to grant themselves features or edit admin notes. The 0001
--    self-update policy pinned status/license/approved_* but NOT features or
--    notes — so without this, a user could call
--    `update profiles set features = '{"feature_1":true}'` with the anon key.
--    Recreate the policy pinning those two columns as well. (Admin writes use
--    the service-role client, which bypasses RLS, so toggles still work.)
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

-- 3. Allow the audit log to record feature toggles.
alter table public.admin_actions drop constraint if exists admin_actions_action_check;
alter table public.admin_actions
  add constraint admin_actions_action_check
  check (action in ('approve','reject','revoke','extend','note','feature'));
