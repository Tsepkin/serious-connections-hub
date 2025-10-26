-- Add meeting request tracking columns to conversations table
ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS meeting_requested_by_user1 boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS meeting_requested_by_user2 boolean DEFAULT false;

-- Add a trigger to automatically set meeting_confirmed when both users confirm
CREATE OR REPLACE FUNCTION public.check_meeting_confirmation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If both users have requested meeting, set meeting_confirmed to true
  IF NEW.meeting_requested_by_user1 = true AND NEW.meeting_requested_by_user2 = true THEN
    NEW.meeting_confirmed = true;
    NEW.meeting_date = NOW();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_meeting_request_update
  BEFORE UPDATE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.check_meeting_confirmation();