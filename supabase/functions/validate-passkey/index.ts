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

    console.log('Validating passkey...');

    if (!passkey) {
      return new Response(
        JSON.stringify({ valid: false, message: 'Invalid request' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Create admin Supabase client using service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check if passkey exists in database and is active
    const { data, error } = await supabaseAdmin
      .from('passkeys')
      .select('id')
      .eq('passkey', passkey)
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ valid: false, message: 'Server error' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    if (data) {
      // Generate a simple session token
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
