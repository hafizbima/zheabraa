-- Skip bulan untuk transaksi berulang: daftar month_id (YYYY-MM) yang dilewati per template
-- Jalankan sekali di: Supabase Dashboard > SQL Editor
alter table public.recurring_templates add column if not exists skip_months jsonb not null default '[]'::jsonb;
