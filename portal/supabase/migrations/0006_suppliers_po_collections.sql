-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║ 0006 — allow the Supplier & Purchase Orders add-on to sync its data       ║
-- ║                                                                          ║
-- ║ Adds two more collections to user_data:                                  ║
-- ║   suppliers — supplier profiles                                          ║
-- ║   po        — purchase orders (with line items)                         ║
-- ║                                                                          ║
-- ║ Same pattern as 0005: widen the collection CHECK only. No table/RLS      ║
-- ║ changes. MUST be applied before suppliers/po can sync (otherwise         ║
-- ║ /api/sync POST fails the CHECK). App still works offline/local without   ║
-- ║ it. Apply via: Supabase Dashboard → SQL Editor → paste → run.            ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

alter table public.user_data
  drop constraint if exists user_data_collection_check;

alter table public.user_data
  add constraint user_data_collection_check
  check (collection in ('inv', 'sales', 'exp', 'suki', 'utang', 'suppliers', 'po'));
