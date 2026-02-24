import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { resumeId, filePath, userId } = await req.json();
    if (!resumeId || !filePath || !userId) {
      return new Response(JSON.stringify({ error: "Missing parameters" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Download the resume file
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("resumes")
      .download(filePath);

    if (downloadError || !fileData) {
      await supabase.from("resumes").update({ status: "failed" }).eq("id", resumeId);
      throw new Error(`Failed to download file: ${downloadError?.message}`);
    }

    // Extract text from file
    const text = await fileData.text();

    // Use AI to extract skills
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are a resume skill extractor. Extract all technical and professional skills from the resume text. Return ONLY a JSON array of objects with this format: [{"skill_name": "skill", "category": "category", "proficiency_level": "level"}]. Categories: "Programming", "Framework", "Database", "Cloud", "Tool", "Soft Skill", "Domain", "Language", "Other". Proficiency levels: "beginner", "intermediate", "advanced", "expert". Be thorough and extract ALL skills mentioned.`,
          },
          {
            role: "user",
            content: `Extract skills from this resume:\n\n${text.substring(0, 8000)}`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_skills",
              description: "Extract skills from a resume",
              parameters: {
                type: "object",
                properties: {
                  skills: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        skill_name: { type: "string" },
                        category: { type: "string" },
                        proficiency_level: {
                          type: "string",
                          enum: ["beginner", "intermediate", "advanced", "expert"],
                        },
                      },
                      required: ["skill_name", "category", "proficiency_level"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["skills"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "extract_skills" } },
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errText);

      if (aiResponse.status === 429) {
        await supabase.from("resumes").update({ status: "failed" }).eq("id", resumeId);
        return new Response(JSON.stringify({ error: "Rate limited, please try again later" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        await supabase.from("resumes").update({ status: "failed" }).eq("id", resumeId);
        return new Response(JSON.stringify({ error: "Credits required" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      await supabase.from("resumes").update({ status: "failed" }).eq("id", resumeId);
      throw new Error(`AI error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    let extractedSkills: any[] = [];

    // Parse tool call response
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const parsed = JSON.parse(toolCall.function.arguments);
      extractedSkills = parsed.skills || [];
    }

    // Insert skills
    if (extractedSkills.length > 0) {
      const skillRows = extractedSkills.map((s: any) => ({
        resume_id: resumeId,
        user_id: userId,
        skill_name: s.skill_name,
        category: s.category || "Other",
        proficiency_level: s.proficiency_level || "intermediate",
      }));

      const { error: insertError } = await supabase.from("extracted_skills").insert(skillRows);
      if (insertError) console.error("Insert error:", insertError);

      // Also update the profile skills array
      const skillNames = extractedSkills.map((s: any) => s.skill_name);
      await supabase
        .from("profiles")
        .update({ skills: skillNames })
        .eq("user_id", userId);
    }

    // Mark resume as completed
    await supabase.from("resumes").update({ status: "completed" }).eq("id", resumeId);

    return new Response(
      JSON.stringify({ success: true, skills_count: extractedSkills.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("extract-skills error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
