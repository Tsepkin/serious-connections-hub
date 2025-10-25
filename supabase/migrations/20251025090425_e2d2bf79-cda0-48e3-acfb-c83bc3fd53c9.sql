-- Fix 1: Restrict profile visibility to authenticated users only
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Authenticated users can view profiles"
  ON public.profiles FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Fix 2: Prevent users from manipulating their own honesty ratings
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can update their own profile info"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    -- Prevent modification of rating fields by comparing with existing values
    AND honesty_rating = (SELECT honesty_rating FROM profiles WHERE id = auth.uid())
    AND total_ratings = (SELECT total_ratings FROM profiles WHERE id = auth.uid())
  );

-- Fix 3: Create function to automatically update honesty ratings
CREATE OR REPLACE FUNCTION public.update_honesty_rating()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE profiles
  SET 
    honesty_rating = COALESCE((SELECT ROUND(AVG(rating)) FROM reviews WHERE reviewed_id = NEW.reviewed_id), 0),
    total_ratings = COALESCE((SELECT COUNT(*) FROM reviews WHERE reviewed_id = NEW.reviewed_id), 0)
  WHERE id = NEW.reviewed_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update ratings automatically when reviews are created
DROP TRIGGER IF EXISTS update_honesty_rating_trigger ON public.reviews;

CREATE TRIGGER update_honesty_rating_trigger
AFTER INSERT ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_honesty_rating();

-- Fix 4: Enforce meeting verification for reviews
DROP POLICY IF EXISTS "Users can create reviews" ON public.reviews;

CREATE POLICY "Users can create reviews after confirmed meetings"
  ON public.reviews FOR INSERT
  WITH CHECK (
    auth.uid() = reviewer_id
    -- Verify a confirmed meeting exists between the two users
    AND EXISTS (
      SELECT 1 FROM conversations
      WHERE id = conversation_id
        AND meeting_confirmed = true
        AND meeting_date < NOW()
        AND (
          (user1_id = auth.uid() AND user2_id = reviewed_id)
          OR (user2_id = auth.uid() AND user1_id = reviewed_id)
        )
    )
    -- Prevent duplicate reviews for the same conversation
    AND NOT EXISTS (
      SELECT 1 FROM reviews r
      WHERE r.reviewer_id = reviewer_id
        AND r.conversation_id = conversation_id
    )
  );