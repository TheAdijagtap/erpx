CREATE POLICY "Parents can view sub-user profiles"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM sub_user_links
    WHERE sub_user_links.parent_user_id = auth.uid()
    AND sub_user_links.sub_user_id = profiles.id
  )
);