-- Add is_bot field to profiles if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'is_bot'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_bot BOOLEAN DEFAULT false;
  END IF;
END $$;