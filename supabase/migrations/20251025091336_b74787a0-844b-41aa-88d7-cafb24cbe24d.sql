-- Add new profile fields for extended questionnaire
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS gender text CHECK (gender IN ('male', 'female')),
ADD COLUMN IF NOT EXISTS looking_for text CHECK (looking_for IN ('male', 'female')),
ADD COLUMN IF NOT EXISTS children text CHECK (children IN ('yes', 'no', 'not_say')),
ADD COLUMN IF NOT EXISTS smoking text CHECK (smoking IN ('smoke', 'not_smoke', 'neutral')),
ADD COLUMN IF NOT EXISTS alcohol text CHECK (alcohol IN ('drink', 'not_drink', 'sometimes')),
ADD COLUMN IF NOT EXISTS zodiac_sign text,
ADD COLUMN IF NOT EXISTS photos text[] DEFAULT ARRAY[]::text[];

-- Update profiles to make new fields required (nullable for now to not break existing data)
ALTER TABLE profiles
ALTER COLUMN gender SET DEFAULT NULL,
ALTER COLUMN looking_for SET DEFAULT NULL;

-- Create storage bucket for profile photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-photos',
  'profile-photos',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for profile photos
CREATE POLICY "Users can view all profile photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-photos');

CREATE POLICY "Users can upload their own photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'profile-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'profile-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'profile-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Add likes table for dating functionality
CREATE TABLE IF NOT EXISTS likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  liked_user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, liked_user_id)
);

ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own likes"
ON likes FOR SELECT
USING (auth.uid() = user_id OR auth.uid() = liked_user_id);

CREATE POLICY "Users can create likes"
ON likes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes"
ON likes FOR DELETE
USING (auth.uid() = user_id);

-- Add meetings table to track confirmed meetings
CREATE TABLE IF NOT EXISTS meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user2_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  confirmed_by_user1 boolean DEFAULT false,
  confirmed_by_user2 boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user1_id, user2_id)
);

ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their meetings"
ON meetings FOR SELECT
USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can create meetings"
ON meetings FOR INSERT
WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can update their meetings"
ON meetings FOR UPDATE
USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_liked_user_id ON likes(liked_user_id);
CREATE INDEX IF NOT EXISTS idx_meetings_users ON meetings(user1_id, user2_id);