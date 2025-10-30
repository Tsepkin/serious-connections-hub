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

    // Get all users with @dating.bot email
    const { data: { users }, error: listError } = await supabaseClient.auth.admin.listUsers();
    
    if (listError) {
      throw listError;
    }

    const botUsers = users.filter(user => user.email?.includes('@dating.bot'));
    
    console.log(`Found ${botUsers.length} bot users to delete`);

    let deletedCount = 0;
    let failedCount = 0;

    // Delete each bot user
    for (const user of botUsers) {
      try {
        const { error: deleteError } = await supabaseClient.auth.admin.deleteUser(user.id);
        
        if (deleteError) {
          console.error(`Failed to delete user ${user.email}:`, deleteError);
          failedCount++;
        } else {
          console.log(`Deleted user: ${user.email}`);
          deletedCount++;
        }
      } catch (error) {
        console.error(`Error deleting user ${user.email}:`, error);
        failedCount++;
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Deleted ${deletedCount} bot users. Failed: ${failedCount}`,
        deletedCount,
        failedCount
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
