-- Social Trust & Verification Migration

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS github_verified boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS twitter_verified boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS github_avatar_url text,
  ADD COLUMN IF NOT EXISTS github_repos_count integer,
  ADD COLUMN IF NOT EXISTS github_followers_count integer,
  ADD COLUMN IF NOT EXISTS github_created_at timestamptz,
  ADD COLUMN IF NOT EXISTS twitter_followers_count integer,
  ADD COLUMN IF NOT EXISTS twitter_tweet_count integer,
  ADD COLUMN IF NOT EXISTS social_stats_updated_at timestamptz;

-- Auto-compute is_verified from social verifications
CREATE OR REPLACE FUNCTION public.update_is_verified()
RETURNS TRIGGER AS $$
BEGIN
  NEW.is_verified = COALESCE(NEW.github_verified, false) OR COALESCE(NEW.twitter_verified, false);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_is_verified ON public.profiles;
CREATE TRIGGER trg_update_is_verified
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_is_verified();
