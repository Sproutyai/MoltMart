-- 1a: New columns on templates table
ALTER TABLE public.templates
  ADD COLUMN IF NOT EXISTS screenshots text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS difficulty text DEFAULT 'beginner'
    CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  ADD COLUMN IF NOT EXISTS ai_models text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS requirements text,
  ADD COLUMN IF NOT EXISTS version text DEFAULT '1.0.0',
  ADD COLUMN IF NOT EXISTS license text DEFAULT 'MIT',
  ADD COLUMN IF NOT EXISTS demo_video_url text,
  ADD COLUMN IF NOT EXISTS setup_instructions text;

-- 1b: Screenshots storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('screenshots', 'screenshots', true)
ON CONFLICT DO NOTHING;

-- 1c: Storage policies for screenshots
CREATE POLICY "screenshots_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'screenshots'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
CREATE POLICY "screenshots_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'screenshots');
CREATE POLICY "screenshots_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'screenshots'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
