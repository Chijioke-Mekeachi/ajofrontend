-- Allow authenticated users to view memberships for public groups.
-- This enables "browse groups" flows to show member lists before joining.
-- Use SECURITY DEFINER helpers to avoid recursive RLS checks.
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
