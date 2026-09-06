-- Fix public lead creation: leads do not have tax_id, so they require a dedicated normalization trigger.
create or replace function public.sync_lead_identity_norms()
returns trigger
language plpgsql
set search_path to 'public'
as $$
begin
  new.normalized_phone := public.normalize_phone(new.phone);
  new.normalized_email := public.normalize_email(new.email);
  return new;
end;
$$;

drop trigger if exists trg_leads_identity_norms on public.leads;
create trigger trg_leads_identity_norms
before insert or update of phone, email on public.leads
for each row execute function public.sync_lead_identity_norms();
