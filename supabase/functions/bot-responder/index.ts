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
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Get all conversations with unresponded messages from real users to bots
    const { data: conversations, error: convError } = await supabase
      .from('conversations')
      .select(`
        id,
        user1_id,
        user2_id,
        messages(id, content, sender_id, created_at)
      `)
      .order('created_at', { foreignTable: 'messages', ascending: false });

    if (convError) throw convError;

    const processedResponses = [];

    for (const conv of conversations || []) {
      // Determine which user is bot
      const { data: user1 } = await supabase
        .from('profiles')
        .select('is_bot, name, about_me, values, rank')
        .eq('id', conv.user1_id)
        .maybeSingle();
      
      const { data: user2 } = await supabase
        .from('profiles')
        .select('is_bot, name, about_me, values, rank')
        .eq('id', conv.user2_id)
        .maybeSingle();

      const botProfile = user1?.is_bot ? user1 : (user2?.is_bot ? user2 : null);
      const botId = user1?.is_bot ? conv.user1_id : (user2?.is_bot ? conv.user2_id : null);

      if (!botId || !botProfile) continue;

      // Check bot rank and apply delay
      const botRank = botProfile.rank || 1;
      if (botRank === 3) {
        // Rank 3 bots respond after ~30 minutes
        const { data: recentBotMessage } = await supabase
          .from('messages')
          .select('created_at')
          .eq('conversation_id', conv.id)
          .eq('sender_id', botId)
          .gte('created_at', new Date(Date.now() - 30 * 60 * 1000).toISOString())
          .maybeSingle();

        if (recentBotMessage) continue; // Skip if bot already responded recently
      }

      // Get last message
      const lastMessage = conv.messages?.[0];
      if (!lastMessage || lastMessage.sender_id === botId) continue;

      // Check if there's already a recent bot response (within last 10 seconds)
      const { data: recentBotMessage } = await supabase
        .from('messages')
        .select('created_at')
        .eq('conversation_id', conv.id)
        .eq('sender_id', botId)
        .gte('created_at', new Date(Date.now() - 10000).toISOString())
        .maybeSingle();

      if (recentBotMessage) continue;

      // Set typing indicator to true before generating response
      await supabase
        .from('typing_indicators')
        .upsert({
          conversation_id: conv.id,
          user_id: botId,
          is_typing: true,
          updated_at: new Date().toISOString(),
        });

      // Get conversation history
      const { data: messages } = await supabase
        .from('messages')
        .select('content, sender_id, created_at')
        .eq('conversation_id', conv.id)
        .order('created_at', { ascending: true });

      // Generate AI response
      const conversationHistory = messages?.map(m => ({
        role: m.sender_id === botId ? 'assistant' : 'user',
        content: m.content
      })) || [];

      // Prepare personality based on rank
      let personality = '';
      if (botRank === 1) {
        personality = 'Будь очень дружелюбным, добрым и отзывчивым. Проявляй искренний интерес к собеседнику.';
      } else if (botRank === 2) {
        personality = 'Будь нейтральным и сдержанным в общении. Отвечай вежливо, но без излишнего энтузиазма.';
      } else {
        personality = 'Будь сухим и неохотным в общении. Отвечай кратко, без особого желания продолжать разговор.';
      }

      const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lovableApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            {
              role: 'system',
              content: `Ты ${botProfile.name}, пользователь сайта знакомств. О тебе: ${botProfile.about_me}. Твои ценности: ${botProfile.values}. ${personality} Отвечай естественно, как реальный человек. Пиши короткие сообщения (1-2 предложения). НЕ ИСПОЛЬЗУЙ эмодзи вообще. Задавай вопросы, чтобы поддержать разговор.`
            },
            ...conversationHistory
          ],
          temperature: 0.9,
          max_tokens: 150
        })
      });

      if (!aiResponse.ok) {
        console.error('AI API error:', await aiResponse.text());
        continue;
      }

      const aiData = await aiResponse.json();
      const botMessage = aiData.choices?.[0]?.message?.content;

      if (botMessage) {
        // Simulate typing delay based on message length (min 1.5s, max 5s)
        const typingDelay = Math.max(1500, Math.min(botMessage.length * 70, 5000));
        await new Promise(resolve => setTimeout(resolve, typingDelay));

        // Send bot message
        const { error: msgError } = await supabase
          .from('messages')
          .insert({
            conversation_id: conv.id,
            sender_id: botId,
            content: botMessage
          });

        // Clear typing indicator after sending message
        await supabase
          .from('typing_indicators')
          .upsert({
            conversation_id: conv.id,
            user_id: botId,
            is_typing: false,
            updated_at: new Date().toISOString(),
          });

        if (!msgError) {
          processedResponses.push({
            conversation_id: conv.id,
            bot_name: botProfile.name,
            message: botMessage
          });
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        responses_sent: processedResponses.length,
        sent: processedResponses
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in bot-responder function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});