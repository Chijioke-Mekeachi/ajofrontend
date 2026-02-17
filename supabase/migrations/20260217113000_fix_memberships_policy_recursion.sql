-- Hotfix: avoid RLS recursion between memberships <-> ajos policies.
-- The previous policy checked public groups by querying ajos directly inside
-- memberships policy, while ajos policy also queries memberships.

-- Ensure membership check helper exists and bypasses RLS safely.
CREATE OR REPLACE FUNCTION public.is_ajo_member(_user_id uuid, _ajo_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.memberships
    WHERE user_id = _user_id
      AND ajo_id = _ajo_id
      AND is_active = true
  )
$$;

-- Helper for public group check that bypasses RLS to prevent recursive policy evaluation.
CREATE OR REPLACE FUNCTION public.is_public_ajo(_ajo_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.ajos
    WHERE id = _ajo_id
      AND is_public = true
  )
$$;

DROP POLICY IF EXISTS "Users can view memberships of their ajos" ON public.memberships;
DROP POLICY IF EXISTS "Users can view memberships of their ajos or public groups" ON public.memberships;

CREATE POLICY "Users can view memberships of their ajos or public groups"
ON public.memberships
FOR SELECT
TO authenticated
USING (
  public.is_ajo_member(auth.uid(), ajo_id)
  OR public.is_public_ajo(ajo_id)
);
