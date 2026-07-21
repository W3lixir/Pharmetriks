-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║ 0011 — signup_requests: add a 'paid' status + payment-verification cols   ║
-- ║                                                                          ║
-- ║ Splits "payment verified" from "account created". The admin now marks a  ║
-- ║ request 'paid' (one tap, after checking the receipt) BEFORE creating the ║
-- ║ account, so a request surfaces as "paid, ready to approve".              ║
-- ║                                                                          ║
-- ║ Forward-compatible: a future payment gateway (PayMongo/Xendit) webhook   ║
-- ║ would set this same 'paid' status AUTOMATICALLY — the admin's "Create    ║
-- ║ account" step stays identical either way.                                ║
-- ║ Apply via: Supabase Dashboard → SQL Editor → paste → run.                ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

-- Extend the status CHECK to allow 'paid' (was: pending, handled, rejected).
alter table public.signup_requests
  drop constraint if exists signup_requests_status_check;

alter table public.signup_requests
  add constraint signup_requests_status_check
    check (status in ('pending', 'paid', 'handled', 'rejected'));

-- Who verified the payment, and when.
alter table public.signup_requests
  add column if not exists paid_at timestamptz,
  add column if not exists paid_by uuid references auth.users(id) on delete set null;
