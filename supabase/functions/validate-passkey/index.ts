import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.78.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { passkey } = await req.json();
    const storedPasskey = Deno.env.get('APP_PASSKEY');

    console.log('Validating passkey...');

    if (!passkey || !storedPasskey) {
      return new Response(
        JSON.stringify({ valid: false, message: 'Invalid request' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    if (passkey === storedPasskey) {
      // Generate a simple session token (in production, use JWT)
      const sessionToken = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours

      console.log('Passkey validated successfully');

      return new Response(
        JSON.stringify({ 
          valid: true, 
          sessionToken,
          expiresAt,
          message: 'Login successful' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    console.log('Invalid passkey provided');

    return new Response(
      JSON.stringify({ valid: false, message: 'Invalid passkey' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
    );
  } catch (error) {
    console.error('Error validating passkey:', error);
    return new Response(
      JSON.stringify({ valid: false, message: 'Server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
