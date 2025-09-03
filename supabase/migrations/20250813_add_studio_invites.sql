-- Studio seats (owner invites up to 4 members)

-- Table to track seats
create table if not exists public.studio_members (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  member_email text not null,
  member_user_id uuid references auth.users(id) on delete set null,
  status text not null default 'invited' check (status in ('invited','accepted','revoked')),
  invited_at timestamptz not null default now(),
  accepted_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, member_email)
);

alter table public.studio_members enable row level security;

-- Owner can CRUD their team rows
create policy "owner_crud_own_team" on public.studio_members
  for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- Member can read their own seat row
create policy "member_read_self" on public.studio_members
  for select
  using (auth.uid() = member_user_id);

-- Reuse/update the timestamp helper with safe search_path
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end
$$;

drop trigger if exists trg_studio_members_updated_at on public.studio_members;
create trigger trg_studio_members_updated_at
before update on public.studio_members
for each row execute function public.update_updated_at_column();

-- Add studio_role to profiles if missing: 'owner' or 'member'
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'profiles' and column_name = 'studio_role'
  ) then
    alter table public.profiles add column studio_role text;
  end if;
end $$;

-- When an invited user signs up, link their seat + promote their profile
create or replace function public.handle_studio_invite_accept()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Link seat by email and mark accepted
  update public.studio_members
     set member_user_id = new.id,
         status = 'accepted',
         accepted_at = now()
   where lower(member_email) = lower(new.email)
     and status = 'invited';

  -- If any seat was linked, ensure they get Studio member access
  update public.profiles
     set plan = 'studio',
         payment_status = coalesce(payment_status, 'active'),
         studio_role = 'member',
         updated_at = now()
   where id = new.id
     and exists (
       select 1 from public.studio_members
       where member_user_id = new.id and status = 'accepted'
     );

  return new;
end
$$;

drop trigger if exists trg_on_auth_user_created_studio on auth.users;
create trigger trg_on_auth_user_created_studio
  after insert on auth.users
  for each row execute function public.handle_studio_invite_accept();

