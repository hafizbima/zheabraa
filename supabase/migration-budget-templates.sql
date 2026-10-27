-- Template budget bulanan untuk menyimpan susunan pocket.
-- Jalankan sekali di: Supabase Dashboard > SQL Editor.
-- Aman dijalankan ulang.
create table if not exists public.budget_templates (
  id text not null,
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  categories jsonb not null default '[]'::jsonb,
  created_at bigint not null default 0,
  primary key (id, user_id)
);

create index if not exists idx_budget_templates_user on public.budget_templates (user_id);

alter table public.budget_templates enable row level security;

drop policy if exists "budget_templates_select" on public.budget_templates;
create policy "budget_templates_select" on public.budget_templates
  for select using (auth.uid() = user_id);
drop policy if exists "budget_templates_insert" on public.budget_templates;
create policy "budget_templates_insert" on public.budget_templates
  for insert with check (auth.uid() = user_id);
drop policy if exists "budget_templates_update" on public.budget_templates;
create policy "budget_templates_update" on public.budget_templates
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "budget_templates_delete" on public.budget_templates;
create policy "budget_templates_delete" on public.budget_templates
  for delete using (auth.uid() = user_id);
