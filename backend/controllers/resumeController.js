const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");
const supabase = require("../utils/supabaseClient");

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
    const data = await pdfParse(fileBuffer);

    // Store in Supabase (guarded against missing config)
    let resumeId = null;
    if (supabase) {
      const { data: resumeRow, error } = await supabase
        .from("resumes")
        .insert({
          user_id: req.user.id,
          file_name: req.file.originalname,
          extracted_text: data.text,
        })
        .select("id")
        .maybeSingle();

      if (!error && resumeRow) {
        resumeId = resumeRow.id;
      } else if (error) {
        console.warn("Resume store warning:", error.message);
      }
    }

    // Delete the uploaded file after extraction
    fs.unlinkSync(filePath);

    return res.json({
      message: "Resume text extracted successfully",
      text: data.text,
      resumeId,
    });
  } catch (error) {
    // Clean up even on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error("Resume extraction error:", error);
    return res.status(500).json({ message: "Failed to extract resume text" });
  }
};