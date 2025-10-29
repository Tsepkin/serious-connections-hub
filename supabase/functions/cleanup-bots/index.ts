import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Male and female names in Russian
    const maleNames = ['Николай', 'Владимир', 'Максим', 'Андрей', 'Иван'];
    const femaleNames = ['Дарья', 'Наталья', 'Анастасия', 'Светлана', 'Юлия'];

    // Get all bots
    const { data: allBots } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('is_bot', true);

    console.log(`Found ${allBots?.length} total bots`);

    // Select 5 unique male and 5 unique female bots
    const selectedMaleBots = new Map();
    const selectedFemaleBots = new Map();
    
    for (const bot of allBots || []) {
      if (maleNames.includes(bot.name) && !selectedMaleBots.has(bot.name) && selectedMaleBots.size < 5) {
        selectedMaleBots.set(bot.name, bot);
      } else if (femaleNames.includes(bot.name) && !selectedFemaleBots.has(bot.name) && selectedFemaleBots.size < 5) {
        selectedFemaleBots.set(bot.name, bot);
      }
    }
    
    const maleBots = Array.from(selectedMaleBots.values());
    const femaleBots = Array.from(selectedFemaleBots.values());
    const botsToKeep = [...maleBots, ...femaleBots].map(bot => bot.id);
    
    console.log(`Keeping ${botsToKeep.length} bots:`, botsToKeep);

    // Delete bots that are not in the keep list
    if (botsToKeep.length > 0) {
      const { error: deleteError } = await supabaseClient
        .from('profiles')
        .delete()
        .eq('is_bot', true)
        .not('id', 'in', `(${botsToKeep.join(',')})`);

      if (deleteError) {
        console.error('Error deleting bots:', deleteError);
      } else {
        console.log('Successfully deleted extra bots');
      }
    }

    // Update gender for remaining bots
    for (const bot of [...maleBots, ...femaleBots]) {
      const correctGender = maleNames.includes(bot.name) ? 'male' : 'female';
      
      await supabaseClient
        .from('profiles')
        .update({ gender: correctGender })
        .eq('id', bot.id);

      console.log(`Updated ${bot.name} to ${correctGender}`);

      // Generate new photo
      try {
        const { data: photoData } = await supabaseClient.functions.invoke('generate-bot-photo', {
          body: { 
            gender: correctGender,
            age: bot.age,
            name: bot.name
          }
        });

        if (photoData?.photo_url) {
          await supabaseClient
            .from('profiles')
            .update({ photo_url: photoData.photo_url })
            .eq('id', bot.id);
          
          console.log(`Updated photo for ${bot.name}`);
        }
      } catch (error) {
        console.error(`Failed to generate photo for ${bot.name}:`, error);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Cleaned up bots. Kept ${botsToKeep.length} bots with correct photos.`,
        bots: botsToKeep 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

