CREATE POLICY "Admins can view all sub-user links"
ON public.sub_user_links
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));