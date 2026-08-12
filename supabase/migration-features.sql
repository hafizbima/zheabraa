-- ============================================================
-- Migration: fitur tambahan (recurring, saving goals, catatan)
-- 1. Kolom note pada months (catatan bulanan)
-- 2. Kolom goal_amount pada categories (target tabungan)
-- 3. Tabel recurring_templates (transaksi berulang) + RLS
-- Jalankan SEKALI di Supabase Dashboard > SQL Editor.
-- Aman dijalankan ulang (idempotent).
-- Catatan: months/categories TIDAK ditambah ke publication
-- supabase_realtime karena sudah terdaftar di schema.sql.
-- ============================================================

alter table public.months add column if not exists note text not null default '';
alter table public.categories add column if not exists goal_amount integer not null default 0;

create table if not exists public.recurring_templates (
  id text not null,
  user_id uuid not null references auth.users (id) on delete cascade,
  day_of_month integer not null default 1,
  amount integer not null default 0,
  category_id text,
  wallet_id text,
  description text not null default '',
  active boolean not null default true,
  created_at bigint not null default 0,
  primary key (id, user_id)
);

create index if not exists idx_templates_user on public.recurring_templates (user_id);

alter table public.recurring_templates enable row level security;

drop policy if exists "templates_select" on public.recurring_templates;
create policy "templates_select" on public.recurring_templates
  for select using (auth.uid() = user_id);
drop policy if exists "templates_insert" on public.recurring_templates;
create policy "templates_insert" on public.recurring_templates
  for insert with check (auth.uid() = user_id);
drop policy if exists "templates_update" on public.recurring_templates;
create policy "templates_update" on public.recurring_templates
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "templates_delete" on public.recurring_templates;
create policy "templates_delete" on public.recurring_templates
  for delete using (auth.uid() = user_id);
