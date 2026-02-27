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

    // UPDATED: Using GEMINI_API_KEY
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Download the resume file
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("resumes")
      .download(filePath);

    if (downloadError || !fileData) {
      await supabase.from("resumes").update({ status: "failed" }).eq("id", resumeId);
      throw new Error(`Failed to download file: ${downloadError?.message}`);
    }

    const text = await fileData.text();

    // 2. Call Google Gemini API directly
    const aiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are a resume skill extractor. Extract technical and professional skills from this text: ${text.substring(0, 8000)}. 
              Return ONLY a JSON object with a "skills" array. 
              Each object must have: "skill_name", "category" (Programming, Framework, Database, Cloud, Tool, Soft Skill, Domain, Language, or Other), and "proficiency_level" (beginner, intermediate, advanced, or expert).`
            }]
          }],
          generationConfig: {
            responseMimeType: "application/json",
          }
        }),
      }
    );

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("Gemini Error:", errText);
      await supabase.from("resumes").update({ status: "failed" }).eq("id", resumeId);
      throw new Error(`AI error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const rawContent = aiData.candidates[0].content.parts[0].text;
    const parsed = JSON.parse(rawContent);
    const extractedSkills = parsed.skills || [];

    // 3. Insert skills into Database
    if (extractedSkills.length > 0) {
      const skillRows = extractedSkills.map((s: any) => ({
        resume_id: resumeId,
        user_id: userId,
        skill_name: s.skill_name,
        category: s.category || "Other",
        proficiency_level: s.proficiency_level || "intermediate",
      }));

      await supabase.from("extracted_skills").insert(skillRows);

      // Update the profile skills array
      const skillNames = extractedSkills.map((s: any) => s.skill_name);
      await supabase
        .from("profiles")
        .update({ skills: skillNames })
        .eq("user_id", userId);
    }

    // 4. Mark resume as completed
    await supabase.from("resumes").update({ status: "completed" }).eq("id", resumeId);

    return new Response(
      JSON.stringify({ success: true, skills_count: extractedSkills.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("Error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
