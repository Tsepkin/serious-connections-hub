-- Add is_bot field to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_bot BOOLEAN DEFAULT false;

-- Create separate bot_profiles table (doesn't require auth.users)
CREATE TABLE IF NOT EXISTS bot_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  gender TEXT NOT NULL,
  city TEXT NOT NULL,
  phone TEXT NOT NULL,
  about_me TEXT NOT NULL,
  values TEXT NOT NULL,
  family_goals TEXT NOT NULL,
  zodiac_sign TEXT,
  smoking TEXT,
  alcohol TEXT,
  children TEXT,
  looking_for TEXT NOT NULL,
  photos TEXT[] DEFAULT ARRAY[]::TEXT[],
  honesty_rating INTEGER DEFAULT 0,
  total_ratings INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE bot_profiles ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view bot profiles
CREATE POLICY "Anyone can view bot profiles" ON bot_profiles
  FOR SELECT USING (true);

-- Create bot response queue table
CREATE TABLE IF NOT EXISTS bot_response_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  bot_id UUID NOT NULL REFERENCES bot_profiles(id) ON DELETE CASCADE,
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on bot_response_queue
ALTER TABLE bot_response_queue ENABLE ROW LEVEL SECURITY;

-- Policy for system to manage queue
CREATE POLICY "System can manage bot queue" ON bot_response_queue
  FOR ALL USING (true);

-- Insert 50 bot profiles
INSERT INTO bot_profiles (name, age, gender, city, phone, about_me, values, family_goals, zodiac_sign, smoking, alcohol, children, looking_for)
SELECT 
  (ARRAY['Алексей', 'Дмитрий', 'Максим', 'Артём', 'Иван', 'Михаил', 'Александр', 'Николай', 'Сергей', 'Владимир', 'Андрей', 'Павел', 'Кирилл', 'Денис', 'Егор', 'Анна', 'Мария', 'Елена', 'Ольга', 'Наталья', 'Татьяна', 'Ирина', 'Екатерина', 'Светлана', 'Юлия', 'Дарья', 'Виктория', 'Анастасия', 'Алина', 'Полина'])[floor(random() * 30 + 1)],
  floor(random() * 20 + 25)::int,
  (ARRAY['male', 'female'])[floor(random() * 2 + 1)] as gender_val,
  (ARRAY['Москва', 'Санкт-Петербург', 'Новосибирск', 'Екатеринбург', 'Казань', 'Нижний Новгород', 'Челябинск', 'Самара', 'Омск', 'Ростов-на-Дону'])[floor(random() * 10 + 1)],
  '+7' || lpad(floor(random() * 10000000000)::text, 10, '0'),
  (ARRAY['Люблю активный образ жизни, путешествия и новые впечатления', 'Ценю честность и искренность в отношениях', 'Работаю в IT, увлекаюсь спортом и чтением', 'Люблю готовить, гулять по паркам и ходить в театр', 'Занимаюсь йогой, интересуюсь психологией', 'Предприниматель, ищу человека для серьёзных отношений'])[floor(random() * 6 + 1)],
  (ARRAY['Честность и доверие', 'Уважение и поддержка', 'Общие интересы и цели', 'Семейные ценности', 'Взаимопонимание'])[floor(random() * 5 + 1)],
  (ARRAY['Хочу создать крепкую семью', 'Планирую детей в будущем', 'Мечтаю о счастливой семейной жизни', 'Готов(а) к серьёзным отношениям'])[floor(random() * 4 + 1)],
  (ARRAY['Овен', 'Телец', 'Близнецы', 'Рак', 'Лев', 'Дева', 'Весы', 'Скорпион', 'Стрелец', 'Козерог', 'Водолей', 'Рыбы'])[floor(random() * 12 + 1)],
  (ARRAY['smoke', 'not_smoke', 'neutral'])[floor(random() * 3 + 1)],
  (ARRAY['drink', 'not_drink', 'sometimes'])[floor(random() * 3 + 1)],
  (ARRAY['yes', 'no', 'not_say'])[floor(random() * 3 + 1)],
  CASE (ARRAY['male', 'female'])[floor(random() * 2 + 1)]
    WHEN 'male' THEN 'female'
    ELSE 'male'
  END
FROM generate_series(1, 50);