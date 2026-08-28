-- Tambah kolom to_wallet_id pada recurring_templates untuk transfer berulang
-- Jalankan sekali di: Supabase Dashboard > SQL Editor
alter table public.recurring_templates add column if not exists to_wallet_id text;
create index if not exists idx_templates_to_wallet on public.recurring_templates (user_id, to_wallet_id);