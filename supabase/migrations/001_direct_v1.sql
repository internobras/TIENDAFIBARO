create extension if not exists pgcrypto;

create table if not exists public.direct_leads (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  service text not null check (service in ('telecom','luz','gas','empresa','ayuda')),
  detail text,
  objective text,
  spend_band text,
  postal_code text check (postal_code is null or postal_code ~ '^[0-9]{5}$'),
  technical_zone boolean not null default false,
  source text,
  medium text,
  campaign text,
  content text,
  landing text,
  status text not null default 'new' check (status in ('new','whatsapp','contacted','won','lost','archived')),
  notes text,
  assigned_to uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists direct_leads_created_at_idx on public.direct_leads(created_at desc);
create index if not exists direct_leads_status_idx on public.direct_leads(status, created_at desc);
create index if not exists direct_leads_source_idx on public.direct_leads(source, created_at desc);

create or replace function public.touch_updated_at() returns trigger language plpgsql set search_path='' as $$
begin new.updated_at = now(); return new; end; $$;
drop trigger if exists direct_leads_touch on public.direct_leads;
create trigger direct_leads_touch before update on public.direct_leads for each row execute function public.touch_updated_at();

alter table public.direct_leads enable row level security;

drop policy if exists "public_can_insert_direct_leads" on public.direct_leads;
create policy "public_can_insert_direct_leads" on public.direct_leads for insert to anon with check (
  reference is not null and char_length(reference) between 4 and 32
  and service in ('telecom','luz','gas','empresa','ayuda')
);

drop policy if exists "staff_can_read_direct_leads" on public.direct_leads;
create policy "staff_can_read_direct_leads" on public.direct_leads for select to authenticated using (true);
drop policy if exists "staff_can_update_direct_leads" on public.direct_leads;
create policy "staff_can_update_direct_leads" on public.direct_leads for update to authenticated using (true) with check (true);

revoke delete on table public.direct_leads from anon, authenticated;