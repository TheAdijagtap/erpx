-- Allow sub-users to read their parent's profile (for subscription inheritance)
CREATE POLICY "Sub-users can view parent profile"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.sub_user_links
    WHERE sub_user_links.sub_user_id = auth.uid()
    AND sub_user_links.parent_user_id = profiles.id
  )
);