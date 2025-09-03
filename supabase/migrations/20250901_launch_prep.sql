-- Launch preparation: index + RLS policy normalization
-- Changes:
-- 1) Add missing index for foreign key studio_members.member_user_id
-- 2) Remove duplicate profiles policies and use SELECT-wrapped auth.uid() to avoid initplan re-evaluation
-- 3) Normalize studio_members policies similarly

BEGIN;

-- 1) Index missing foreign key
CREATE INDEX IF NOT EXISTS idx_studio_members_member_user_id
  ON public.studio_members(member_user_id);

-- 2) Profiles policies: drop duplicates and recreate optimized policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = id);

-- 3) Studio members: normalize policies to use SELECT-wrapped auth.uid()
DROP POLICY IF EXISTS "owner_crud_own_team" ON public.studio_members;
CREATE POLICY "owner_crud_own_team" ON public.studio_members
  FOR ALL
  USING ((SELECT auth.uid()) = owner_id)
  WITH CHECK ((SELECT auth.uid()) = owner_id);

DROP POLICY IF EXISTS "member_read_self" ON public.studio_members;
CREATE POLICY "member_read_self" ON public.studio_members
  FOR SELECT USING ((SELECT auth.uid()) = member_user_id);

COMMIT;


