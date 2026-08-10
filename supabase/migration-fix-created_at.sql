-- ============================================================
-- Migration: created_at -> bigint (millis)
-- Perbaiki error "22008 date/time field value out of range"
-- Jalankan SEKALI di Supabase Dashboard > SQL Editor.
-- Aman dijalankan ulang (no-op jika kolom sudah bigint).
-- ============================================================

-- wallet
alter table public.wallets alter column created_at drop default;
alter table public.wallets alter column created_at type bigint using extract(epoch from created_at)::bigint * 1000;
alter table public.wallets alter column created_at set default 0;

-- months
alter table public.months alter column created_at drop default;
alter table public.months alter column created_at type bigint using extract(epoch from created_at)::bigint * 1000;
alter table public.months alter column created_at set default 0;

-- categories
alter table public.categories alter column created_at drop default;
alter table public.categories alter column created_at type bigint using extract(epoch from created_at)::bigint * 1000;
alter table public.categories alter column created_at set default 0;
