
-- Civic topics (versioned learn content)
CREATE TABLE IF NOT EXISTS public.civic_topics (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          text UNIQUE NOT NULL,
  title         text NOT NULL,
  summary       text NOT NULL,
  sections      jsonb NOT NULL DEFAULT '[]'::jsonb,
  source        text,
  version       int NOT NULL DEFAULT 1,
  locale        text NOT NULL DEFAULT 'en',
  is_published  boolean NOT NULL DEFAULT false,
  published_at  timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.civic_topics TO anon, authenticated;
GRANT ALL ON public.civic_topics TO service_role;
ALTER TABLE public.civic_topics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Published civic topics are public" ON public.civic_topics;
CREATE POLICY "Published civic topics are public"
  ON public.civic_topics FOR SELECT
  TO anon, authenticated
  USING (is_published = true);

DROP POLICY IF EXISTS "Admins manage civic topics" ON public.civic_topics;
CREATE POLICY "Admins manage civic topics"
  ON public.civic_topics FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS update_civic_topics_updated_at ON public.civic_topics;
CREATE TRIGGER update_civic_topics_updated_at
  BEFORE UPDATE ON public.civic_topics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Bookmarks
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_slug  text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, topic_slug)
);

GRANT SELECT, INSERT, DELETE ON public.bookmarks TO authenticated;
GRANT ALL ON public.bookmarks TO service_role;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own bookmarks" ON public.bookmarks;
CREATE POLICY "Users manage own bookmarks"
  ON public.bookmarks FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Learning progress
CREATE TABLE IF NOT EXISTS public.learning_progress (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_slug    text NOT NULL,
  completed_at  timestamptz,
  quiz_score    int CHECK (quiz_score BETWEEN 0 AND 100),
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, topic_slug)
);

GRANT SELECT, INSERT, UPDATE ON public.learning_progress TO authenticated;
GRANT ALL ON public.learning_progress TO service_role;
ALTER TABLE public.learning_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own learning progress" ON public.learning_progress;
CREATE POLICY "Users manage own learning progress"
  ON public.learning_progress FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_learning_progress_updated_at ON public.learning_progress;
CREATE TRIGGER update_learning_progress_updated_at
  BEFORE UPDATE ON public.learning_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Anonymous analytics (no PII)
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type   text NOT NULL,
  topic_slug   text,
  persona      text,
  locale       text,
  session_hash text NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.analytics_events TO service_role;
GRANT ALL ON public.analytics_events TO service_role;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_analytics_events_type_created
  ON public.analytics_events (event_type, created_at DESC);

-- AI rate limiting (service role only)
CREATE TABLE IF NOT EXISTS public.ai_usage (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  session_hash text UNIQUE,
  daily_count  int NOT NULL DEFAULT 0,
  reset_at     date NOT NULL DEFAULT CURRENT_DATE,
  CONSTRAINT ai_usage_identity CHECK (user_id IS NOT NULL OR session_hash IS NOT NULL)
);

GRANT ALL ON public.ai_usage TO service_role;
ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_ai_usage_reset ON public.ai_usage (reset_at);
