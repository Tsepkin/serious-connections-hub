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
      'Люблю активный образ жизни, путешествия и новые впечатления. В свободное время занимаюсь спортом, люблю бегать по утрам в парке. Обожаю открывать новые места и культуры, мечтаю объездить весь мир. Ценю искренность и открытость в общении.',
      'Работаю в IT-сфере, увлекаюсь программированием и новыми технологиями. В выходные люблю читать книги, особенно научную фантастику и психологию. Стараюсь постоянно развиваться и учиться чему-то новому. Ищу человека с похожими интересами для серьёзных отношений.',
      'Люблю готовить и экспериментировать на кухне, особенно люблю итальянскую и азиатскую кухню. Часто гуляю по паркам, обожаю природу и свежий воздух. Регулярно хожу в театр и на выставки. Ценю в людях доброту и чувство юмора.',
      'Занимаюсь йогой уже несколько лет, это помогает мне поддерживать баланс в жизни. Интересуюсь психологией и саморазвитием, читаю много книг по этим темам. Люблю проводить время с друзьями, но и ценю моменты уединения. Ищу гармоничные и искренние отношения.',
      'Предприниматель, занимаюсь своим бизнесом в сфере маркетинга. Люблю путешествовать и открывать новые горизонты, как в работе, так и в личной жизни. В свободное время занимаюсь фитнесом и плаванием. Ищу партнёра для создания крепкой и счастливой семьи.',
      'Работаю дизайнером, обожаю творчество и всё, что с ним связано. Люблю посещать художественные галереи, концерты и культурные мероприятия. В выходные люблю выезжать на природу, ходить в походы. Ценю честность, верность и взаимное уважение в отношениях.',
      'Увлекаюсь фотографией, люблю запечатлевать красивые моменты и эмоции. Активно занимаюсь спортом - теннис, велосипед, зимой катаюсь на лыжах. Обожаю животных, у меня есть кот. Ищу человека, с которым можно разделить радости жизни и построить счастливое будущее.',
      'Врач по профессии, очень люблю свою работу и помогать людям. В свободное время люблю читать медицинскую литературу и художественные романы. Занимаюсь танцами и йогой. Ценю в людях искренность, доброту и ответственность. Мечтаю о гармоничной семье.'
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
      const age = Math.floor(Math.random() * 20) + 25;
      
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

      // Generate photo for bot
      let photoUrl = null;
      try {
        const photoResponse = await fetch(`${supabaseUrl}/functions/v1/generate-bot-photo`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ gender, age, name })
        });
        
        if (photoResponse.ok) {
          const photoData = await photoResponse.json();
          photoUrl = photoData.photoUrl;
        }
      } catch (photoError) {
        console.error(`Error generating photo for bot ${i + 1}:`, photoError);
      }

      // Create profile (bots are created in main profiles table)
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          name,
          age,
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
          photo_url: photoUrl,
          photos: photoUrl ? [photoUrl] : [],
          is_bot: true,
          rank: Math.floor(Math.random() * 3) + 1 // Random rank 1-3
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