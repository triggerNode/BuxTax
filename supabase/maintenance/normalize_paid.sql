-- Normalize payment_status to 'active' for paid plans
-- Safe to run multiple times
update public.profiles
set payment_status = 'active', updated_at = now()
where plan in ('lifetime', 'studio') and (payment_status is null or payment_status <> 'active');

-- Optional: quick check (uncomment to inspect remaining mismatches)
-- select id, plan, payment_status from public.profiles
-- where plan in ('lifetime','studio') and (payment_status is null or payment_status <> 'active');
