-- Add notification preferences column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notification_prefs jsonb DEFAULT '{}'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN profiles.notification_prefs IS 'User notification preferences (email toggles for purchases, sales, reviews, marketing)';
