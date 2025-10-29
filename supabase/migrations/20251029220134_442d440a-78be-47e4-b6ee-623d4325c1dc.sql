-- Remove existing foreign keys if they exist
ALTER TABLE conversations DROP CONSTRAINT IF EXISTS conversations_user1_id_fkey;
ALTER TABLE conversations DROP CONSTRAINT IF EXISTS conversations_user2_id_fkey;

-- Add foreign keys that reference profiles table
ALTER TABLE conversations 
  ADD CONSTRAINT conversations_user1_id_fkey 
  FOREIGN KEY (user1_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE conversations 
  ADD CONSTRAINT conversations_user2_id_fkey 
  FOREIGN KEY (user2_id) REFERENCES profiles(id) ON DELETE CASCADE;