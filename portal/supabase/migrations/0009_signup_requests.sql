-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║ 0009 — Signup requests (public signup = LEAD, not an account)             ║
-- ║                                                                          ║
-- ║ Public signup no longer creates a Supabase auth user. Instead it stores  ║
-- ║ a request here (name, pharmacy, email, suggested password, receipt) and  ║
-- ║ emails the admin. The admin reviews the receipt and CREATES the account  ║
-- ║ from /admin/requests — so the admin knows the credentials from day one.  ║
-- ║                                                                          ║
-- ║ The suggested `password` is CLEARED the moment the account is created.   ║
-- ║ RLS is enabled with NO policies → only the service role (signup action + ║
-- ║ admin actions) can read/write. Never exposed to anon/auth clients.       ║
-- ║ Apply via: Supabase Dashboard → SQL Editor → paste → run.                ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

create table if not exists public.signup_requests (
  id                uuid primary key default gen_random_uuid(),
  full_name         text not null,
  pharmacy_name     text not null,
  email             text not null,
  password          text,        -- user's suggested password; CLEARED once handled
  receipt_path      text,        -- object path in the 'receipts' storage bucket
  payment_reference text,
  status            text not null default 'pending'
                      check (status in ('pending', 'handled', 'rejected')),
  handled_by        uuid references auth.users(id) on delete set null,
  handled_at        timestamptz,
  created_at        timestamptz not null default now()
);

create index if not exists signup_requests_status_idx
  on public.signup_requests (status, created_at desc);

-- Service-role only. No policies are added on purpose.
alter table public.signup_requests enable row level security;
