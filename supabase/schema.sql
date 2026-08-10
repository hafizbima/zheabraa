-- ============================================================
-- Gimme Money — Supabase schema (PostgreSQL + RLS + Realtime)
-- Jalankan sekali di: Supabase Dashboard > SQL Editor
-- (Auth wajib aktif: Authentication > Providers > Email)
-- ============================================================

-- ---------- wallets ----------
create table if not exists public.wallets (
  id text not null,
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null default 'Dompet',
  color text not null default '#3B82F6',
  opening_balance integer not null default 0,
  sort_order integer not null default 0,
  deleted boolean not null default false,
  created_at bigint not null default 0,
  primary key (id, user_id)
);

create index if not exists idx_wallets_user on public.wallets (user_id);

alter table public.wallets enable row level security;

create policy "wallets_select" on public.wallets
  for select using (auth.uid() = user_id);
create policy "wallets_insert" on public.wallets
  for insert with check (auth.uid() = user_id);
create policy "wallets_update" on public.wallets
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "wallets_delete" on public.wallets
  for delete using (auth.uid() = user_id);

-- ---------- months ----------
create table if not exists public.months (
  id text not null,
  user_id uuid not null references auth.users (id) on delete cascade,
  label text not null,
  carry_over integer not null default 0,
  incomes jsonb not null default '[]'::jsonb,
  created_at bigint not null default 0,
  primary key (id, user_id)
);

create index if not exists idx_months_user on public.months (user_id);

alter table public.months enable row level security;

create policy "months_select" on public.months
  for select using (auth.uid() = user_id);
create policy "months_insert" on public.months
  for insert with check (auth.uid() = user_id);
create policy "months_update" on public.months
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "months_delete" on public.months
  for delete using (auth.uid() = user_id);

-- ---------- categories ----------
create table if not exists public.categories (
  id text not null,
  user_id uuid not null references auth.users (id) on delete cascade,
  month_id text not null,
  name text not null,
  budget_amount integer not null default 0,
  color text not null default '#8B5CF6',
  sort_order integer not null default 0,
  created_at bigint not null default 0,
  primary key (id, user_id)
);

create index if not exists idx_categories_month on public.categories (user_id, month_id);

alter table public.categories enable row level security;

create policy "categories_select" on public.categories
  for select using (auth.uid() = user_id);
create policy "categories_insert" on public.categories
  for insert with check (auth.uid() = user_id);
create policy "categories_update" on public.categories
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "categories_delete" on public.categories
  for delete using (auth.uid() = user_id);

-- ---------- transactions ----------
create table if not exists public.transactions (
  id text not null,
  user_id uuid not null references auth.users (id) on delete cascade,
  month_id text not null,
  date text not null,
  amount integer not null default 0,
  type text not null default 'expense',
  category_id text,
  wallet_id text,
  description text not null default '',
  created_at bigint not null default 0,
  primary key (id, user_id)
);

create index if not exists idx_transactions_month on public.transactions (user_id, month_id);

alter table public.transactions enable row level security;

create policy "transactions_select" on public.transactions
  for select using (auth.uid() = user_id);
create policy "transactions_insert" on public.transactions
  for insert with check (auth.uid() = user_id);
create policy "transactions_update" on public.transactions
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "transactions_delete" on public.transactions
  for delete using (auth.uid() = user_id);

-- ---------- realtime ----------
alter publication supabase_realtime add table public.wallets;
alter publication supabase_realtime add table public.months;
alter publication supabase_realtime add table public.categories;
alter publication supabase_realtime add table public.transactions;
