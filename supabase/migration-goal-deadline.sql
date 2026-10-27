-- Deadline target tabungan per pocket.
-- Jalankan sekali di: Supabase Dashboard > SQL Editor.
-- Aman dijalankan ulang.
alter table public.categories
  add column if not exists goal_deadline text;
