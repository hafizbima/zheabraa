-- Income jadi transaksi type='income' (satu sumber kebenaran; masuk Riwayat native).
-- Memindahkan isi month.incomes (jsonb) ke tabel transactions. Idempoten — aman diulang.
-- Jalankan sekali di: Supabase Dashboard > SQL Editor

insert into public.transactions (id, user_id, month_id, date, amount, type, category_id, wallet_id, to_wallet_id, description, created_at)
select
  inc->>'id'                                   as id,
  m.user_id,
  m.id                                         as month_id,
  m.id || '-01'                                as date,
  coalesce((inc->>'amount')::integer, 0)       as amount,
  'income'                                     as type,
  null                                         as category_id,
  null                                         as wallet_id,
  null                                         as to_wallet_id,
  coalesce(inc->>'label', 'Pemasukan')         as description,
  coalesce((inc->>'createdAt')::bigint, 0)     as created_at
from public.months m,
     jsonb_array_elements(m.incomes) as inc
where inc->>'id' is not null
  and inc->>'id' <> ''
  and (inc->>'amount')::integer > 0
on conflict (id, user_id) do nothing;
