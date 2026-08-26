-- RLS referensial: cegah transaksi/template menunjuk kategori atau dompet milik user lain
-- (sebelumnya kategori_id/wallet_id adalah teks bebas tanpa cek kepemilikan).
-- Jalankan sekali di: Supabase Dashboard > SQL Editor

drop policy if exists "transactions_insert" on public.transactions;
create policy "transactions_insert" on public.transactions
  for insert with check (
    auth.uid() = user_id
    and (category_id is null or exists (select 1 from public.categories c where c.id = category_id and c.user_id = auth.uid()))
    and (wallet_id is null or exists (select 1 from public.wallets w where w.id = wallet_id and w.user_id = auth.uid() and w.deleted = false))
    and (to_wallet_id is null or exists (select 1 from public.wallets w where w.id = to_wallet_id and w.user_id = auth.uid() and w.deleted = false))
  );

drop policy if exists "transactions_update" on public.transactions;
create policy "transactions_update" on public.transactions
  for update using (auth.uid() = user_id) with check (
    auth.uid() = user_id
    and (category_id is null or exists (select 1 from public.categories c where c.id = category_id and c.user_id = auth.uid()))
    and (wallet_id is null or exists (select 1 from public.wallets w where w.id = wallet_id and w.user_id = auth.uid() and w.deleted = false))
    and (to_wallet_id is null or exists (select 1 from public.wallets w where w.id = to_wallet_id and w.user_id = auth.uid() and w.deleted = false))
  );

drop policy if exists "templates_insert" on public.recurring_templates;
create policy "templates_insert" on public.recurring_templates
  for insert with check (
    auth.uid() = user_id
    and (category_id is null or exists (select 1 from public.categories c where c.id = category_id and c.user_id = auth.uid()))
    and (wallet_id is null or exists (select 1 from public.wallets w where w.id = wallet_id and w.user_id = auth.uid() and w.deleted = false))
  );

drop policy if exists "templates_update" on public.recurring_templates;
create policy "templates_update" on public.recurring_templates
  for update using (auth.uid() = user_id) with check (
    auth.uid() = user_id
    and (category_id is null or exists (select 1 from public.categories c where c.id = category_id and c.user_id = auth.uid()))
    and (wallet_id is null or exists (select 1 from public.wallets w where w.id = wallet_id and w.user_id = auth.uid() and w.deleted = false))
  );
