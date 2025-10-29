-- Add rank field to profiles table for bots
ALTER TABLE profiles ADD COLUMN rank integer DEFAULT 1 CHECK (rank >= 1 AND rank <= 3);

-- Update existing bots with random ranks
UPDATE profiles 
SET rank = floor(random() * 3 + 1)::integer 
WHERE is_bot = true;

-- Create typing_indicators table to track who is typing
CREATE TABLE typing_indicators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  is_typing boolean DEFAULT false,
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(conversation_id, user_id)
);

-- Enable RLS
ALTER TABLE typing_indicators ENABLE ROW LEVEL SECURITY;

-- Allow users to view typing indicators in their conversations
CREATE POLICY "Users can view typing in their conversations"
ON typing_indicators FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM conversations
    WHERE conversations.id = typing_indicators.conversation_id
    AND (conversations.user1_id = auth.uid() OR conversations.user2_id = auth.uid())
  )
);

-- Allow users to update their own typing status
CREATE POLICY "Users can update their typing status"
ON typing_indicators FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can modify their typing status"
ON typing_indicators FOR UPDATE
USING (auth.uid() = user_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE typing_indicators;