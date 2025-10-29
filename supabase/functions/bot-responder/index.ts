import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Get all unprocessed bot responses from queue
    const { data: queueItems, error: queueError } = await supabaseClient
      .from('bot_response_queue')
      .select('*, bot_profiles(*), messages(*), conversations(*)')
      .eq('processed', false)
      .lte('scheduled_at', new Date().toISOString());

    if (queueError) throw queueError;

    console.log(`Processing ${queueItems?.length || 0} queued bot responses`);

    for (const item of queueItems || []) {
      try {
        // Get conversation history
        const { data: messages } = await supabaseClient
          .from('messages')
          .select('content, sender_id')
          .eq('conversation_id', item.conversation_id)
          .order('created_at', { ascending: true });

        // Build conversation context
        const conversationHistory = messages?.map(m => ({
          role: m.sender_id === item.bot_id ? 'assistant' : 'user',
          content: m.content
        })) || [];

        // Generate AI response
        const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              {
                role: 'system',
                content: `Ты ${item.bot_profiles.name}, ${item.bot_profiles.age} лет, из города ${item.bot_profiles.city}. ${item.bot_profiles.about_me}. Твои ценности: ${item.bot_profiles.values}. Общайся естественно, по-дружески, как реальный человек на сайте знакомств. Отвечай кратко (1-3 предложения), иногда задавай встречные вопросы. Используй эмоции и разговорный стиль.`
              },
              ...conversationHistory
            ],
          }),
        });

        if (!aiResponse.ok) {
          console.error('AI API error:', await aiResponse.text());
          continue;
        }

        const aiData = await aiResponse.json();
        const botMessage = aiData.choices?.[0]?.message?.content;

        if (botMessage) {
          // Insert bot response
          const { error: insertError } = await supabaseClient
            .from('messages')
            .insert({
              conversation_id: item.conversation_id,
              sender_id: item.bot_id,
              content: botMessage
            });

          if (insertError) {
            console.error('Error inserting bot message:', insertError);
            continue;
          }
        }

        // Mark as processed
        await supabaseClient
          .from('bot_response_queue')
          .update({ processed: true })
          .eq('id', item.id);

        console.log(`Bot ${item.bot_profiles.name} responded to conversation ${item.conversation_id}`);
      } catch (err) {
        console.error(`Error processing queue item ${item.id}:`, err);
      }
    }

    // Check for new messages to bots that need responses
    const { data: recentMessages } = await supabaseClient
      .from('messages')
      .select('*, conversations!inner(user1_id, user2_id)')
      .gte('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });

    for (const message of recentMessages || []) {
      const conv = message.conversations;
      const botId = message.sender_id === conv.user1_id ? conv.user2_id : conv.user1_id;

      // Check if recipient is a bot
      const { data: botProfile } = await supabaseClient
        .from('bot_profiles')
        .select('id')
        .eq('id', botId)
        .maybeSingle();

      if (botProfile) {
        // Check if response already queued
        const { data: existing } = await supabaseClient
          .from('bot_response_queue')
          .select('id')
          .eq('message_id', message.id)
          .eq('bot_id', botId)
          .maybeSingle();

        if (!existing) {
          // Schedule random delay between 20s and 30 minutes
          const delaySeconds = Math.floor(Math.random() * (30 * 60 - 20) + 20);
          const scheduledAt = new Date(Date.now() + delaySeconds * 1000);

          await supabaseClient
            .from('bot_response_queue')
            .insert({
              conversation_id: message.conversation_id,
              bot_id: botId,
              message_id: message.id,
              scheduled_at: scheduledAt.toISOString()
            });

          console.log(`Scheduled bot response in ${delaySeconds}s for conversation ${message.conversation_id}`);
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, processed: queueItems?.length || 0 }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Bot responder error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
