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
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all bots
    const { data: bots, error: botsError } = await supabase
      .from('profiles')
      .select('id, name, age, gender')
      .eq('is_bot', true);

    if (botsError) {
      throw botsError;
    }

    console.log(`Found ${bots.length} bots to update`);
    const updated = [];
    const failed = [];

    // Update photos for each bot
    for (const bot of bots) {
      try {
        console.log(`Generating photo for bot: ${bot.name}`);
        
        // Call generate-bot-photo function
        const { data: photoData, error: photoError } = await supabase.functions.invoke('generate-bot-photo', {
          body: {
            name: bot.name,
            age: bot.age,
            gender: bot.gender
          }
        });

        if (photoError) {
          console.error(`Failed to generate photo for ${bot.name}:`, photoError);
          failed.push({ name: bot.name, error: photoError.message });
          continue;
        }

        if (!photoData?.photoUrl) {
          console.error(`No photo URL returned for ${bot.name}`);
          failed.push({ name: bot.name, error: 'No photo URL returned' });
          continue;
        }

        // Update bot profile with new photo
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            photo_url: photoData.photoUrl,
            photos: [photoData.photoUrl]
          })
          .eq('id', bot.id);

        if (updateError) {
          console.error(`Failed to update profile for ${bot.name}:`, updateError);
          failed.push({ name: bot.name, error: updateError.message });
          continue;
        }

        console.log(`Successfully updated photo for ${bot.name}`);
        updated.push(bot.name);

        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`Error processing bot ${bot.name}:`, error);
        failed.push({ name: bot.name, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        total: bots.length,
        updated: updated.length,
        failed: failed.length,
        updatedBots: updated,
        failedBots: failed
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in update-bot-photos:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
