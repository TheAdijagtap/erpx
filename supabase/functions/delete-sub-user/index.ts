import { createClient } from "https://esm.sh/@supabase/supabase-js@2.78.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify calling user
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: callingUser }, error: authError } = await userClient.auth.getUser();
    if (authError || !callingUser) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { subUserId } = await req.json();
    if (!subUserId) {
      return new Response(JSON.stringify({ error: "subUserId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Verify the calling user is the parent of this sub-user
    const { data: link } = await adminClient
      .from("sub_user_links")
      .select("id")
      .eq("parent_user_id", callingUser.id)
      .eq("sub_user_id", subUserId)
      .maybeSingle();

    if (!link) {
      return new Response(JSON.stringify({ error: "Sub-user not found or not yours" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Delete permissions
    await adminClient
      .from("sub_user_permissions")
      .delete()
      .eq("sub_user_id", subUserId);

    // Delete link
    await adminClient
      .from("sub_user_links")
      .delete()
      .eq("sub_user_id", subUserId);

    // Delete profile
    await adminClient
      .from("profiles")
      .delete()
      .eq("id", subUserId);

    // Delete the auth user entirely — this fully revokes login access
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(subUserId);
    if (deleteError) {
      console.error("Failed to delete auth user:", deleteError.message);
      return new Response(JSON.stringify({ error: "Failed to delete auth user: " + deleteError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Successfully deleted sub-user:", subUserId);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
