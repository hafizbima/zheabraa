-- One-time data repair — menggantikan auto-repair runtime di StoreContext (dihapus).
-- Memperbaiki dua penyakit data lama:
--   1) transaksi tersimpan di bulan yang salah (month_id != bulan di kolom date)
--   2) category_id menunjuk id pocket bulan lain → dipetakan ke pocket bulan yang benar via key
-- Jalankan SEKALI di: Supabase Dashboard > SQL Editor. Aman diulang (idempoten).

-- 1) pindahkan transaksi ke bulan yang benar (berdasarkan date)
update public.transactions
set month_id = left(date, 7)
where left(date, 7) <> month_id;

-- 2) perbaiki category_id yang tidak valid di bulannya:
--    petakan via key ke pocket bulan yang sama (key = slug nama pocket)
update public.transactions t
set category_id = c2.id
from public.categories c1
join public.categories c2
  on c2.user_id = c1.user_id
 and c2.month_id = t.month_id
 and coalesce(c2.key, c2.name) = coalesce(c1.key, c1.name)
where t.user_id = c1.user_id
  and t.month_id = left(t.date, 7)
  and t.category_id = c1.id
  and c1.month_id <> t.month_id;

-- sisa category_id yang tetap tidak valid → kosongkan (jadwal ke Uang Bebas)
update public.transactions t
set category_id = null
where t.category_id is not null
  and not exists (
    select 1 from public.categories c
    where c.id = t.category_id and c.user_id = t.user_id and c.month_id = t.month_id
  );
