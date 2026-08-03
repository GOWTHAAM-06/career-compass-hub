const fs = require("fs");
const path = require("path");
const { PDFParse } = require("pdf-parse");
const supabase = require("../utils/supabaseClient");
const { extractSkills } = require("../utils/skillExtractor");

exports.extractText = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No resume uploaded" });
    }

    const filePath = req.file.path;

    if (path.extname(req.file.originalname).toLowerCase() !== ".pdf") {
      fs.unlinkSync(filePath);
      return res.status(400).json({ message: "Only PDF files allowed" });
    }

    const fileBuffer = fs.readFileSync(filePath);

    // pdf-parse v2 API: instantiate PDFParse with options, then call getText()
    const parser = new PDFParse({ data: fileBuffer });
    const result = await parser.getText({ pageJoiner: "\n" });

    const extractedText = result.text;

    // Phase 2: Parse raw text into structured skill categories
    const { skills, categories } = extractSkills(extractedText);

    // Store in Supabase (guarded against missing config)
    let resumeId = null;
    if (supabase) {
      const { data: resumeRow, error } = await supabase
        .from("resumes")
        .insert({
          user_id: req.user.id,
          file_name: req.file.originalname,
          extracted_text: extractedText,
        })
        .select("id")
        .maybeSingle();

      if (!error && resumeRow) {
        resumeId = resumeRow.id;

        // Save parsed skills linked to this resume
        if (skills.length > 0) {
          const skillRows = skills.map((skill) => ({
            resume_id: resumeId,
            name: skill.name,
            category: skill.category,
          }));

          const { error: skillError } = await supabase
            .from("skills")
            .insert(skillRows);

          if (skillError) {
            console.warn("Skills store warning:", skillError.message);
          }
        }
      } else if (error) {
        console.warn("Resume store warning:", error.message);
      }
    }

    // Delete the uploaded file after extraction
    fs.unlinkSync(filePath);

    return res.json({
      message: "Resume text extracted successfully",
      text: extractedText,
      resumeId,
      skills,
      categories,
    });
  } catch (error) {
    // Clean up even on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error("Resume extraction error:", error.message);
    return res.status(500).json({ message: "Failed to extract resume text" });
  }
};