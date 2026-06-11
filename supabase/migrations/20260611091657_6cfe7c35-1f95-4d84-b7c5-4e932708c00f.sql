
-- profiles
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are viewable by owner" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$
LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- polls
CREATE TABLE public.polls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  description text,
  category text NOT NULL,
  closes_at timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.polls TO anon, authenticated;
GRANT ALL ON public.polls TO service_role;
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Polls are publicly viewable" ON public.polls FOR SELECT TO anon, authenticated USING (true);

CREATE TRIGGER update_polls_updated_at BEFORE UPDATE ON public.polls
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- poll options
CREATE TABLE public.poll_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id uuid NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
  label text NOT NULL,
  position int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.poll_options TO anon, authenticated;
GRANT ALL ON public.poll_options TO service_role;
ALTER TABLE public.poll_options ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Poll options are publicly viewable" ON public.poll_options FOR SELECT TO anon, authenticated USING (true);
CREATE INDEX idx_poll_options_poll ON public.poll_options(poll_id);

-- poll votes (one per user per poll)
CREATE TABLE public.poll_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id uuid NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
  option_id uuid NOT NULL REFERENCES public.poll_options(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (poll_id, user_id)
);
GRANT SELECT, INSERT, DELETE ON public.poll_votes TO authenticated;
GRANT ALL ON public.poll_votes TO service_role;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone authenticated can read votes (for tallies)" ON public.poll_votes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can cast their own vote" ON public.poll_votes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can withdraw their own vote" ON public.poll_votes FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX idx_poll_votes_poll ON public.poll_votes(poll_id);

-- Public tally view (counts only — no user IDs)
CREATE OR REPLACE VIEW public.poll_tallies
WITH (security_invoker = true) AS
SELECT
  o.id AS option_id,
  o.poll_id,
  o.label,
  o.position,
  COUNT(v.id) AS votes
FROM public.poll_options o
LEFT JOIN public.poll_votes v ON v.option_id = o.id
GROUP BY o.id, o.poll_id, o.label, o.position;

GRANT SELECT ON public.poll_tallies TO anon, authenticated;

-- Seed neutral civic polls
INSERT INTO public.polls (question, description, category) VALUES
  ('Which civic topic do you want to learn more about?', 'Help us prioritize new explainers.', 'Civic literacy'),
  ('How do you usually follow public participation forums?', 'Pick the channel you rely on most.', 'Public participation'),
  ('Which county service have you used in the last year?', 'Anonymous tally only.', 'Public services');

INSERT INTO public.poll_options (poll_id, label, position)
SELECT id, label, pos FROM public.polls,
LATERAL (VALUES
  ('The Constitution', 1),
  ('How Parliament works', 2),
  ('Public finance & budgets', 3),
  ('Devolution & counties', 4)
) AS t(label, pos)
WHERE question = 'Which civic topic do you want to learn more about?';

INSERT INTO public.poll_options (poll_id, label, position)
SELECT id, label, pos FROM public.polls,
LATERAL (VALUES
  ('County social media', 1),
  ('Local newspapers / radio', 2),
  ('In-person Baraza meetings', 3),
  ('I do not follow them yet', 4)
) AS t(label, pos)
WHERE question = 'How do you usually follow public participation forums?';

INSERT INTO public.poll_options (poll_id, label, position)
SELECT id, label, pos FROM public.polls,
LATERAL (VALUES
  ('Huduma Centre', 1),
  ('County office', 2),
  ('eCitizen online', 3),
  ('None', 4)
) AS t(label, pos)
WHERE question = 'Which county service have you used in the last year?';
