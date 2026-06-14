DROP POLICY IF EXISTS "Anyone authenticated can read votes (for tallies)" ON public.poll_votes;

CREATE POLICY "Users can read only their own votes"
ON public.poll_votes
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);