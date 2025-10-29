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

    // Get all unprocessed messages from real users to bots
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

    const responsesScheduled = [];

    for (const conv of conversations || []) {
      // Determine which user is bot
      const { data: user1 } = await supabase
        .from('profiles')
        .select('is_bot')
        .eq('id', conv.user1_id)
        .single();
      
      const { data: user2 } = await supabase
        .from('profiles')
        .select('is_bot')
        .eq('id', conv.user2_id)
        .single();

      const botId = user1?.is_bot ? conv.user1_id : (user2?.is_bot ? conv.user2_id : null);

      if (!botId) continue;

      // Get last message
      const lastMessage = conv.messages?.[0];
      if (!lastMessage || lastMessage.sender_id === botId) continue;

      // Check if bot already has a queued response
      const { data: existingQueue } = await supabase
        .from('bot_response_queue')
        .select('id')
        .eq('conversation_id', conv.id)
        .eq('message_id', lastMessage.id)
        .maybeSingle();

      if (existingQueue) continue;

      // Schedule random delay (20 seconds to 30 minutes)
      const delayMs = Math.floor(Math.random() * (30 * 60 * 1000 - 20 * 1000)) + 20 * 1000;
      const scheduledAt = new Date(Date.now() + delayMs);

      // Queue response
      const { error: queueError } = await supabase
        .from('bot_response_queue')
        .insert({
          conversation_id: conv.id,
          bot_id: botId,
          message_id: lastMessage.id,
          scheduled_at: scheduledAt.toISOString(),
          processed: false
        });

      if (!queueError) {
        responsesScheduled.push({ 
          conversation_id: conv.id, 
          scheduled_at: scheduledAt,
          delay_seconds: Math.floor(delayMs / 1000)
        });
      }
    }

    // Process due responses
    const { data: dueResponses, error: dueError } = await supabase
      .from('bot_response_queue')
      .select('*')
      .eq('processed', false)
      .lte('scheduled_at', new Date().toISOString());

    if (dueError) throw dueError;

    const processedResponses = [];

    for (const response of dueResponses || []) {
      // Get conversation history
      const { data: messages } = await supabase
        .from('messages')
        .select('content, sender_id, created_at')
        .eq('conversation_id', response.conversation_id)
        .order('created_at', { ascending: true });

      // Get bot profile for context
      const { data: botProfile } = await supabase
        .from('profiles')
        .select('name, about_me, values')
        .eq('id', response.bot_id)
        .single();

      // Generate AI response
      const conversationHistory = messages?.map(m => ({
        role: m.sender_id === response.bot_id ? 'assistant' : 'user',
        content: m.content
      })) || [];

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
              content: `Ты ${botProfile?.name}, пользователь сайта знакомств. О тебе: ${botProfile?.about_me}. Твои ценности: ${botProfile?.values}. Отвечай естественно, как реальный человек. Будь дружелюбным и заинтересованным. Пиши короткие сообщения (1-3 предложения). Задавай вопросы, чтобы поддержать разговор. Используй эмодзи изредка.`
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
        // Send bot message
        const { error: msgError } = await supabase
          .from('messages')
          .insert({
            conversation_id: response.conversation_id,
            sender_id: response.bot_id,
            content: botMessage
          });

        if (!msgError) {
          // Mark as processed
          await supabase
            .from('bot_response_queue')
            .update({ processed: true })
            .eq('id', response.id);

          processedResponses.push({
            conversation_id: response.conversation_id,
            message: botMessage
          });
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        responses_scheduled: responsesScheduled.length,
        responses_sent: processedResponses.length,
        scheduled: responsesScheduled,
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