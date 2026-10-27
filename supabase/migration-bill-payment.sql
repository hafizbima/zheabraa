-- Link transaksi pembayaran dengan template tagihan berulang.
-- Jalankan sekali di: Supabase Dashboard > SQL Editor.
-- Aman dijalankan ulang.
alter table public.transactions
  add column if not exists recurring_template_id text;

create index if not exists idx_transactions_recurring_template
  on public.transactions (user_id, recurring_template_id);
