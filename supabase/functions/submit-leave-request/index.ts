import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, employee_name, leave_type, start_date, end_date, reason } = await req.json();

    if (!user_id || !employee_name || !start_date || !end_date) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Find employee by name under this user
    const { data: employees, error: empError } = await supabase
      .from("employees")
      .select("id, name")
      .eq("user_id", user_id)
      .ilike("name", employee_name.trim())
      .limit(1);

    if (empError || !employees || employees.length === 0) {
      return new Response(JSON.stringify({ error: "Employee not found. Please enter your name exactly as registered." }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const employee = employees[0];
    const start = new Date(start_date);
    const end = new Date(end_date);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    if (days < 1) {
      return new Response(JSON.stringify({ error: "End date must be after start date" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { error: insertError } = await supabase.from("leaves").insert({
      user_id,
      employee_id: employee.id,
      leave_type: leave_type || "casual",
      start_date,
      end_date,
      days,
      reason: reason || null,
      status: "pending",
    });

    if (insertError) {
      console.error("Insert error:", insertError);
      return new Response(JSON.stringify({ error: "Failed to submit leave request" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, message: "Leave request submitted successfully" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
