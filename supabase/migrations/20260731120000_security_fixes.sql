-- Security fixes:
--   1. Re-assert owner-only SELECT on vote tables, in case an earlier,
--      more permissive policy is still live (idempotent either way).
--   2. Remove the ability for any signed-in user to call has_role() via RPC
--      to probe another user's role membership. has_role() is only ever used
--      internally by RLS policies as has_role(auth.uid(), ...), so dropping
--      the target-user-id parameter removes the unused, exploitable surface
--      without changing any policy's actual behaviour.

-- 1. Vote visibility -----------------------------------------------------

DROP POLICY IF EXISTS "Anyone authenticated can read votes (for tallies)" ON public.poll_votes;
DROP POLICY IF EXISTS "Users can read only their own votes" ON public.poll_votes;
CREATE POLICY "Users can read only their own votes"
  ON public.poll_votes FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users read only their own topic votes" ON public.voting_topic_votes;
CREATE POLICY "Users read only their own topic votes"
  ON public.voting_topic_votes FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- 2. has_role() no longer accepts an arbitrary target user id -----------

DROP POLICY IF EXISTS "Admins manage voting topics insert" ON public.voting_topics;
DROP POLICY IF EXISTS "Admins manage voting topics update" ON public.voting_topics;
DROP POLICY IF EXISTS "Admins manage voting topics delete" ON public.voting_topics;
DROP POLICY IF EXISTS "Admins manage voting options insert" ON public.voting_topic_options;
DROP POLICY IF EXISTS "Admins manage voting options update" ON public.voting_topic_options;
DROP POLICY IF EXISTS "Admins manage voting options delete" ON public.voting_topic_options;
DROP POLICY IF EXISTS "Admins manage civic topics" ON public.civic_topics;

DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);

CREATE FUNCTION public.has_role(_role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = _role)
$$;

REVOKE EXECUTE ON FUNCTION public.has_role(public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(public.app_role) TO authenticated, service_role;

CREATE POLICY "Admins manage voting topics insert" ON public.voting_topics
  FOR INSERT TO authenticated WITH CHECK (public.has_role('admin'));
CREATE POLICY "Admins manage voting topics update" ON public.voting_topics
  FOR UPDATE TO authenticated USING (public.has_role('admin')) WITH CHECK (public.has_role('admin'));
CREATE POLICY "Admins manage voting topics delete" ON public.voting_topics
  FOR DELETE TO authenticated USING (public.has_role('admin'));

CREATE POLICY "Admins manage voting options insert" ON public.voting_topic_options
  FOR INSERT TO authenticated WITH CHECK (public.has_role('admin'));
CREATE POLICY "Admins manage voting options update" ON public.voting_topic_options
  FOR UPDATE TO authenticated USING (public.has_role('admin')) WITH CHECK (public.has_role('admin'));
CREATE POLICY "Admins manage voting options delete" ON public.voting_topic_options
  FOR DELETE TO authenticated USING (public.has_role('admin'));

CREATE POLICY "Admins manage civic topics" ON public.civic_topics
  FOR ALL TO authenticated USING (public.has_role('admin')) WITH CHECK (public.has_role('admin'));
