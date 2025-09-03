-- Sanity: DB reachable?
select now() as db_time;

-- Create/ensure users + profiles
-- We create email-confirmed users via auth.admin.create_user,
-- then upsert their profile rows to desired plan/payment state.

do $$
declare
  v_id uuid;
begin
  -- FREE tester
  select id into v_id from auth.users where email = 'qa-free@buxtax.test';
  if v_id is null then
    select id into v_id from auth.admin.create_user(
      email => 'qa-free@buxtax.test',
      password => 'BuxTax_Free_!234',
      email_confirm => true
    );
  end if;

  insert into public.profiles (id, plan, status, payment_status)
  values (v_id, 'free', 'inactive', 'inactive')
  on conflict (id) do update
    set plan='free', status='inactive', payment_status='inactive', updated_at=now();
end $$;

do $$
declare
  v_id uuid;
begin
  -- LIFETIME tester
  select id into v_id from auth.users where email = 'qa-lifetime@buxtax.test';
  if v_id is null then
    select id into v_id from auth.admin.create_user(
      email => 'qa-lifetime@buxtax.test',
      password => 'BuxTax_Life_!234',
      email_confirm => true
    );
  end if;

  insert into public.profiles (id, plan, status, payment_status)
  values (v_id, 'lifetime', 'active', 'active')
  on conflict (id) do update
    set plan='lifetime', status='active', payment_status='active', updated_at=now();
end $$;

do $$
declare
  v_id uuid;
begin
  -- STUDIO tester
  select id into v_id from auth.users where email = 'qa-studio@buxtax.test';
  if v_id is null then
    select id into v_id from auth.admin.create_user(
      email => 'qa-studio@buxtax.test',
      password => 'BuxTax_Studio_!234',
      email_confirm => true
    );
  end if;

  insert into public.profiles (id, plan, status, payment_status)
  values (v_id, 'studio', 'active', 'active')
  on conflict (id) do update
    set plan='studio', status='active', payment_status='active', updated_at=now();
end $$;

-- Final verification
select u.email, p.plan, p.status, p.payment_status
from auth.users u
join public.profiles p on p.id = u.id
where u.email in ('qa-free@buxtax.test','qa-lifetime@buxtax.test','qa-studio@buxtax.test')
order by u.email;

