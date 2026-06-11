-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║ 0005 — allow the Utang & Suki Tracker add-on to sync its collections      ║
-- ║                                                                          ║
-- ║ The Utang tracker stores two new collections in user_data:               ║
-- ║   suki   — customer (suki) profiles                                      ║
-- ║   utang  — ledger entries (charge / payment)                             ║
-- ║                                                                          ║
-- ║ This widens the collection CHECK from 0003 so pushes for these names     ║
-- ║ are accepted. No table/RLS changes — same user_data table and policies.  ║
-- ║                                                                          ║
-- ║ MUST be applied before suki/utang can sync; otherwise /api/sync POST     ║
-- ║ fails the CHECK (500). The app still works fully offline/local without   ║
-- ║ it. Apply via: Supabase Dashboard → SQL Editor → paste → run.            ║
-- ║                                                                          ║
-- ║ NOTE: assumes the 0003 inline CHECK kept Postgres' default name          ║
-- ║ `user_data_collection_check`. If your DB named it differently, the DROP  ║
-- ║ below no-ops and the ADD will error ("already has constraint"); in that  ║
-- ║ case drop the real constraint name first (see pg_constraint).            ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

alter table public.user_data
  drop constraint if exists user_data_collection_check;

alter table public.user_data
  add constraint user_data_collection_check
  check (collection in ('inv', 'sales', 'exp', 'suki', 'utang'));
