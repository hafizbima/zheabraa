-- Kategori stabil antar bulan: kolom `key` (slug) jadi identitas, bukan id (id berganti tiap bulan).
-- Jalankan sekali di: Supabase Dashboard > SQL Editor
alter table public.categories add column if not exists key text;

-- Backfill key dari nama untuk data lama
update public.categories
set key = lower(regexp_replace(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g'), '^-+|-+$', '', 'g'))
where key is null or key = '';

create index if not exists idx_categories_key on public.categories (user_id, month_id, key);
