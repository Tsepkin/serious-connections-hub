import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const russianNames = [
      'Алексей', 'Дмитрий', 'Максим', 'Артём', 'Иван', 'Михаил', 
      'Александр', 'Николай', 'Сергей', 'Владимир', 'Андрей', 'Павел',
      'Кирилл', 'Денис', 'Егор', 'Анна', 'Мария', 'Елена', 
      'Ольга', 'Наталья', 'Татьяна', 'Ирина', 'Екатерина', 'Светлана',
      'Юлия', 'Дарья', 'Виктория', 'Анастасия', 'Алина', 'Полина'
    ];

    const cities = [
      'Москва', 'Санкт-Петербург', 'Новосибирск', 'Екатеринбург', 
      'Казань', 'Нижний Новгород', 'Челябинск', 'Самара', 
      'Омск', 'Ростов-на-Дону'
    ];

    const aboutMe = [
      'Люблю активный образ жизни, путешествия и новые впечатления',
      'Ценю честность и искренность в отношениях',
      'Работаю в IT, увлекаюсь спортом и чтением',
      'Люблю готовить, гулять по паркам и ходить в театр',
      'Занимаюсь йогой, интересуюсь психологией',
      'Предприниматель, ищу человека для серьёзных отношений'
    ];

    const values = [
      'Честность и доверие', 'Уважение и поддержка', 
      'Общие интересы и цели', 'Семейные ценности', 
      'Взаимопонимание'
    ];

    const familyGoals = [
      'Хочу создать крепкую семью',
      'Планирую детей в будущем',
      'Мечтаю о счастливой семейной жизни',
      'Готов(а) к серьёзным отношениям'
    ];

    const zodiacSigns = [
      'Овен', 'Телец', 'Близнецы', 'Рак', 'Лев', 'Дева',
      'Весы', 'Скорпион', 'Стрелец', 'Козерог', 'Водолей', 'Рыбы'
    ];

    const createdBots = [];

    for (let i = 0; i < 50; i++) {
      const name = russianNames[Math.floor(Math.random() * russianNames.length)];
      const email = `bot${i + 1}_${Date.now()}@dating.bot`;
      const password = `BotPass${Math.random().toString(36).substring(7)}!123`;
      const gender = Math.random() > 0.5 ? 'male' : 'female';
      
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name }
      });

      if (authError) {
        console.error(`Error creating bot ${i + 1}:`, authError);
        continue;
      }

      // Create profile (bots are created in main profiles table)
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          name,
          age: Math.floor(Math.random() * 20) + 25,
          gender,
          city: cities[Math.floor(Math.random() * cities.length)],
          phone: `+7${Math.floor(Math.random() * 10000000000).toString().padStart(10, '0')}`,
          about_me: aboutMe[Math.floor(Math.random() * aboutMe.length)],
          values: values[Math.floor(Math.random() * values.length)],
          family_goals: familyGoals[Math.floor(Math.random() * familyGoals.length)],
          zodiac_sign: zodiacSigns[Math.floor(Math.random() * zodiacSigns.length)],
          smoking: ['smoke', 'not_smoke', 'neutral'][Math.floor(Math.random() * 3)],
          alcohol: ['drink', 'not_drink', 'sometimes'][Math.floor(Math.random() * 3)],
          children: ['yes', 'no', 'not_say'][Math.floor(Math.random() * 3)],
          looking_for: gender === 'male' ? 'female' : 'male',
          is_bot: true
        });

      if (profileError) {
        console.error(`Error creating profile for bot ${i + 1}:`, profileError);
      } else {
        createdBots.push({ id: authData.user.id, name, email });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        created: createdBots.length,
        bots: createdBots 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in create-bots function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});