-- ============================================================
-- Migration: pemasukan berulang
-- 1. Kolom type pada recurring_templates ('expense' | 'income')
--    Template income menambah ke daftar Pemasukan bulan, bukan transaksi.
-- Jalankan SEKALI di Supabase Dashboard > SQL Editor.
-- Aman dijalankan ulang (no-op jika kolom sudah ada).
-- ============================================================

alter table public.recurring_templates add column if not exists type text not null default 'expense';