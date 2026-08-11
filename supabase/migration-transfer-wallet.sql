-- ============================================================
-- Migration: transfer antar dompet
-- Tambah kolom to_wallet_id pada tabel transactions
-- (dompet tujuan untuk transaksi tipe 'transfer')
-- Jalankan SEKALI di Supabase Dashboard > SQL Editor.
-- Aman dijalankan ulang (no-op jika kolom sudah ada).
-- ============================================================

alter table public.transactions add column if not exists to_wallet_id text;
