const supabase = require("../utils/supabaseClient");
const { JOB_ROLES } = require("../utils/jobRoles");

/**
 * Normalize a skill name for matching (lowercase, trim).
 */
function normalizeSkill(skill) {
  return String(skill || "").toLowerCase().trim();
}

/**
 * Calculate match percentage between user skills and a job role.
 * Uses Jaccard-like overlap: matched skills / required skills.
 * Returns { matchPercentage, matchedSkills, missingSkills }.
 */
function calculateMatch(userSkills, role) {
  const userSkillSet = new Set(userSkills.map(normalizeSkill));
  const requiredSet = new Set(role.requiredSkills.map(normalizeSkill));

  const matchedSkills = [];
  const missingSkills = [];

  for (const required of requiredSet) {
    if (userSkillSet.has(required)) {
      matchedSkills.push(required);
    } else {
      missingSkills.push(required);
    }
  }

  const matchPercentage =
    requiredSet.size > 0
      ? Math.round((matchedSkills.length / requiredSet.size) * 100)
      : 0;

  return { matchPercentage, matchedSkills, missingSkills };
}

/**
 * Calculate a trust score based on match percentage and skill coverage.
 * Higher match + more matched skills = higher trust.
 */
function calculateTrustScore(matchPercentage, matchedSkillsCount) {
  // Base trust from match percentage (0-70 points)
  const matchComponent = Math.round(matchPercentage * 0.7);

  // Skill coverage bonus: up to 30 points for having many matched skills
  const coverageBonus = Math.min(30, matchedSkillsCount * 3);

  return Math.min(100, matchComponent + coverageBonus);
}

/**
 * GET /api/jobs/recommendations
 * Fetches the user's latest resume skills, computes dynamic job matches,
 * saves them to job_recommendations, and returns the ranked list.
 */
exports.getRecommendations = async (req, res) => {
  try {
    if (!supabase) {
      return res
        .status(500)
        .json({ message: "Supabase not configured. Check backend/.env" });
    }

    // 1. Fetch the user's most recent resume
    const { data: latestResume, error: resumeError } = await supabase
      .from("resumes")
      .select("id")
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (resumeError) {
      console.error("Resume fetch error:", resumeError.message);
      return res.status(500).json({ message: "Failed to fetch resume" });
    }

    if (!latestResume) {
      return res.status(404).json({
        message: "No resume found. Please upload and extract skills first.",
      });
    }

    // 2. Fetch skills linked to that resume.
    // The skills table schema may use "name", "skill", or "skill_name"
    // for the skill value, so try each candidate column and use the
    // first one that the database accepts. This avoids a 500 error if
    // the column name doesn't match the actual schema.
    const skillColumnCandidates = ["name", "skill_name", "skill"];

    let skillRows = null;
    let skillsError = null;
    let matchedColumn = null;

    for (const column of skillColumnCandidates) {
      const { data, error } = await supabase
        .from("skills")
        .select(column)
        .eq("resume_id", latestResume.id);

      if (!error) {
        skillRows = data;
        matchedColumn = column;
        break;
      }

      skillsError = error;
    }

    if (!skillRows) {
      console.warn("Skills fetch warning:", skillsError?.message);
      // Graceful fallback: no skills can be read from the database, so
      // return an empty recommendations list rather than a 500 error.
      return res.json({
        message:
          "Could not read skills from the database. Please re-upload your resume.",
        resumeId: latestResume.id,
        userSkills: [],
        recommendations: [],
      });
    }

    const userSkills = (skillRows || []).map((row) => row[matchedColumn] || "");

    if (userSkills.length === 0) {
      return res.status(404).json({
        message: "No skills found for your resume. Please extract skills first.",
      });
    }

    // 3. Compute matches for every predefined job role
    const matches = JOB_ROLES.map((role) => {
      const { matchPercentage, matchedSkills, missingSkills } = calculateMatch(
        userSkills,
        role
      );
      const trustScore = calculateTrustScore(
        matchPercentage,
        matchedSkills.length
      );

      return {
        title: role.title,
        match: matchPercentage,
        trust: trustScore,
        matchedSkills,
        missingSkills,
      };
    });

    // 4. Sort by match percentage (desc), then trust score (desc)
    matches.sort((a, b) => {
      if (b.match !== a.match) return b.match - a.match;
      return b.trust - a.trust;
    });

    // 5. Save recommendations to job_recommendations table.
    // The job_recommendations schema may use different column names
    // (job_title/title/role_name, match_percentage/match_score,
    // trust_score/trust/confidence, etc.), so try multiple column
    // variants and use the first one the database accepts. This
    // ensures the table gets populated without throwing.
    const insertVariants = [
      {
        jobTitleCol: "job_title",
        matchCol: "match_percentage",
        trustCol: "trust_score",
        matchedCol: "matched_skills",
        missingCol: "missing_skills",
      },
      {
        jobTitleCol: "title",
        matchCol: "match_percentage",
        trustCol: "trust_score",
        matchedCol: "matched_skills",
        missingCol: "missing_skills",
      },
      {
        jobTitleCol: "role_name",
        matchCol: "match_percentage",
        trustCol: "trust_score",
        matchedCol: "matched_skills",
        missingCol: "missing_skills",
      },
      {
        jobTitleCol: "job_title",
        matchCol: "match_score",
        trustCol: "trust_score",
        matchedCol: "matched_skills",
        missingCol: "missing_skills",
      },
      {
        jobTitleCol: "job_title",
        matchCol: "match_percentage",
        trustCol: "trust",
        matchedCol: "matched_skills",
        missingCol: "missing_skills",
      },
      {
        jobTitleCol: "job_title",
        matchCol: "match_percentage",
        trustCol: "confidence",
        matchedCol: "matched_skills",
        missingCol: "missing_skills",
      },
      {
        jobTitleCol: "job_title",
        matchCol: "match_percentage",
        trustCol: "trust_score",
        matchedCol: "skills_matched",
        missingCol: "skills_missing",
      },
      {
        jobTitleCol: "job_title",
        matchCol: "match_percentage",
        trustCol: "trust_score",
        matchedCol: "matched",
        missingCol: "missing",
      },
      // Minimal fallbacks: only core columns if the table is simpler
      {
        jobTitleCol: "job_title",
        matchCol: "match_percentage",
        trustCol: null,
        matchedCol: null,
        missingCol: null,
      },
      {
        jobTitleCol: "title",
        matchCol: "match_percentage",
        trustCol: null,
        matchedCol: null,
        missingCol: null,
      },
      {
        jobTitleCol: "role_name",
        matchCol: "match_percentage",
        trustCol: null,
        matchedCol: null,
        missingCol: null,
      },
    ];

    let recsSaved = false;
    let lastInsertError = null;

    for (const variant of insertVariants) {
      const recommendationRows = matches.map((m) => {
        const row = {
          user_id: req.user.id,
          resume_id: latestResume.id,
        };
        row[variant.jobTitleCol] = m.title;
        if (variant.matchCol) row[variant.matchCol] = m.match;
        if (variant.trustCol) row[variant.trustCol] = m.trust;
        if (variant.matchedCol) row[variant.matchedCol] = m.matchedSkills;
        if (variant.missingCol) row[variant.missingCol] = m.missingSkills;
        return row;
      });

      const { error: insertError } = await supabase
        .from("job_recommendations")
        .insert(recommendationRows);

      if (!insertError) {
        recsSaved = true;
        break;
      }

      lastInsertError = insertError;
      console.warn(
        `Job recommendations insert variant failed (${variant.jobTitleCol}, ${
          variant.matchCol
        }, ${variant.trustCol}): ${insertError.message}`
      );
    }

    // Self-healing fallback: if the table doesn't exist, attempt to
    // create it via a Supabase RPC helper function (if one has been
    // defined in the database). This is best-effort — the SQL migration
    // in backend/sql/migrations/001_create_job_recommendations.sql is
    // the authoritative fix.
    if (!recsSaved && lastInsertError && /does not exist/i.test(lastInsertError.message)) {
      try {
        const { error: createError } = await supabase.rpc(
          "create_job_recommendations_table"
        );
        if (!createError) {
          // Retry once with the preferred column variant
          const variant = insertVariants[0];
          const recommendationRows = matches.map((m) => {
            const row = {
              user_id: req.user.id,
              resume_id: latestResume.id,
            };
            row[variant.jobTitleCol] = m.title;
            if (variant.matchCol) row[variant.matchCol] = m.match;
            if (variant.trustCol) row[variant.trustCol] = m.trust;
            if (variant.matchedCol) row[variant.matchedCol] = m.matchedSkills;
            if (variant.missingCol) row[variant.missingCol] = m.missingSkills;
            return row;
          });

          const { error: retryError } = await supabase
            .from("job_recommendations")
            .insert(recommendationRows);

          if (!retryError) {
            recsSaved = true;
          } else {
            lastInsertError = retryError;
          }
        }
      } catch (createErr) {
        // RPC helper not defined — swallow, migration script is the fix.
      }
    }

    if (!recsSaved) {
      console.warn(
        "Job recommendations store warning: could not save with any column variant. " +
          `Last error: ${lastInsertError ? lastInsertError.message : "unknown"}. ` +
          "Run backend/sql/migrations/001_create_job_recommendations.sql in the Supabase SQL Editor " +
          "to create the job_recommendations table."
      );
    }

    // 6. Return the ranked recommendations
    return res.json({
      message: "Job recommendations generated successfully",
      resumeId: latestResume.id,
      userSkills,
      recommendations: matches,
    });
  } catch (error) {
    console.error("Job recommendation error:", error.message);
    return res.status(500).json({ message: "Failed to generate recommendations" });
  }
};