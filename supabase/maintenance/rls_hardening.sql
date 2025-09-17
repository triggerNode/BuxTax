-- Harden RLS so app users cannot escalate their plan or payment status.
-- Adjust roles to your setup as needed. These commands affect privileges, not policies.

-- Prevent anonymous and authenticated clients from updating plan or payment_status directly
revoke update (plan, payment_status) on table public.profiles from anon, authenticated;

-- Allow only the service role to update these columns (server-side)
grant update (plan, payment_status) on table public.profiles to service_role;

-- Optional: verify current grants (uncomment to inspect)
-- select grantee, privilege_type
-- from information_schema.role_table_grants
-- where table_schema = 'public' and table_name = 'profiles';
