
-- Profiles: add ID + phone
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS national_id text,
  ADD COLUMN IF NOT EXISTS phone text;

-- Roles
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read their own roles" ON public.user_roles;
CREATE POLICY "Users can read their own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- Voting topics (admin-created subjects of matter)
CREATE TABLE IF NOT EXISTS public.voting_topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'General',
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  is_active boolean NOT NULL DEFAULT true,
  closes_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.voting_topics TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.voting_topics TO authenticated;
GRANT ALL ON public.voting_topics TO service_role;
ALTER TABLE public.voting_topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Voting topics are publicly viewable" ON public.voting_topics
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage voting topics insert" ON public.voting_topics
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage voting topics update" ON public.voting_topics
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage voting topics delete" ON public.voting_topics
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Options
CREATE TABLE IF NOT EXISTS public.voting_topic_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id uuid NOT NULL REFERENCES public.voting_topics(id) ON DELETE CASCADE,
  label text NOT NULL,
  position int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.voting_topic_options TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.voting_topic_options TO authenticated;
GRANT ALL ON public.voting_topic_options TO service_role;
ALTER TABLE public.voting_topic_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Voting options are publicly viewable" ON public.voting_topic_options
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage voting options insert" ON public.voting_topic_options
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage voting options update" ON public.voting_topic_options
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage voting options delete" ON public.voting_topic_options
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Votes
CREATE TABLE IF NOT EXISTS public.voting_topic_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id uuid NOT NULL REFERENCES public.voting_topics(id) ON DELETE CASCADE,
  option_id uuid NOT NULL REFERENCES public.voting_topic_options(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (topic_id, user_id)
);
GRANT SELECT, INSERT, DELETE ON public.voting_topic_votes TO authenticated;
GRANT ALL ON public.voting_topic_votes TO service_role;
ALTER TABLE public.voting_topic_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read only their own topic votes" ON public.voting_topic_votes
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users cast their own topic vote" ON public.voting_topic_votes
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users withdraw their own topic vote" ON public.voting_topic_votes
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Public tallies view
CREATE OR REPLACE VIEW public.voting_topic_tallies AS
SELECT
  o.id   AS option_id,
  o.topic_id,
  o.label,
  o.position,
  COUNT(v.id) AS votes
FROM public.voting_topic_options o
LEFT JOIN public.voting_topic_votes v ON v.option_id = o.id
GROUP BY o.id, o.topic_id, o.label, o.position;

GRANT SELECT ON public.voting_topic_tallies TO anon, authenticated;

-- updated_at trigger on voting_topics
DROP TRIGGER IF EXISTS update_voting_topics_updated_at ON public.voting_topics;
CREATE TRIGGER update_voting_topics_updated_at
  BEFORE UPDATE ON public.voting_topics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
