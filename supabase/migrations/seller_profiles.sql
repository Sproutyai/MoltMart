-- Seller Profiles Migration

-- 1a. New columns on profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS banner_url text,
  ADD COLUMN IF NOT EXISTS website text,
  ADD COLUMN IF NOT EXISTS github_username text,
  ADD COLUMN IF NOT EXISTS twitter_username text,
  ADD COLUMN IF NOT EXISTS specialties text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS follower_count integer DEFAULT 0;

CREATE INDEX IF NOT EXISTS profiles_username_idx ON public.profiles(username);
CREATE INDEX IF NOT EXISTS profiles_is_seller_idx ON public.profiles(is_seller);

-- 1b. seller_follows table
CREATE TABLE IF NOT EXISTS public.seller_follows (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  seller_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(follower_id, seller_id)
);
ALTER TABLE public.seller_follows ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "follows_select" ON public.seller_follows FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "follows_insert" ON public.seller_follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "follows_delete" ON public.seller_follows FOR DELETE USING (auth.uid() = follower_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Trigger to update follower_count
CREATE OR REPLACE FUNCTION public.update_follower_count()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles SET follower_count = follower_count + 1 WHERE id = NEW.seller_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profiles SET follower_count = follower_count - 1 WHERE id = OLD.seller_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_follow_change ON public.seller_follows;
CREATE TRIGGER on_follow_change
  AFTER INSERT OR DELETE ON public.seller_follows
  FOR EACH ROW EXECUTE PROCEDURE public.update_follower_count();

-- 1c. featured_templates table
CREATE TABLE IF NOT EXISTS public.featured_templates (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  template_id uuid NOT NULL REFERENCES public.templates(id) ON DELETE CASCADE,
  position integer DEFAULT 0,
  UNIQUE(seller_id, template_id)
);
ALTER TABLE public.featured_templates ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "featured_select" ON public.featured_templates FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "featured_insert" ON public.featured_templates FOR INSERT WITH CHECK (auth.uid() = seller_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "featured_update" ON public.featured_templates FOR UPDATE USING (auth.uid() = seller_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "featured_delete" ON public.featured_templates FOR DELETE USING (auth.uid() = seller_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 1d. Seller stats function
CREATE OR REPLACE FUNCTION public.get_seller_stats(seller_uuid uuid)
RETURNS TABLE(
  total_templates integer,
  total_downloads bigint,
  avg_rating numeric,
  total_reviews bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    count(*)::integer AS total_templates,
    coalesce(sum(t.download_count), 0)::bigint AS total_downloads,
    coalesce(avg(NULLIF(t.avg_rating, 0)), 0)::numeric AS avg_rating,
    coalesce(sum(t.review_count), 0)::bigint AS total_reviews
  FROM public.templates t
  WHERE t.seller_id = seller_uuid AND t.status = 'published';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
