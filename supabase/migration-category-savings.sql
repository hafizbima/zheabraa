-- Tabungan: akumulasi saldo tabungan per pocket (pocket dengan target = tabungan)
-- Jalankan sekali di: Supabase Dashboard > SQL Editor
alter table public.categories add column if not exists saved_amount integer not null default 0;
update public.categories set saved_amount = 0 where saved_amount is null;
