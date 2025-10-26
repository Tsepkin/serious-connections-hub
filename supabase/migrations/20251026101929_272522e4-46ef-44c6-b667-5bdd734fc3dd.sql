-- Create dislikes table
CREATE TABLE IF NOT EXISTS public.dislikes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  disliked_user_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, disliked_user_id)
);

-- Enable Row Level Security
ALTER TABLE public.dislikes ENABLE ROW LEVEL SECURITY;

-- Create policies for dislikes
CREATE POLICY "Users can create dislikes" 
ON public.dislikes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view dislikes" 
ON public.dislikes 
FOR SELECT 
USING ((auth.uid() = user_id) OR (auth.uid() = disliked_user_id));

CREATE POLICY "Users can delete their own dislikes" 
ON public.dislikes 
FOR DELETE 
USING (auth.uid() = user_id);