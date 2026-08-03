import { useState } from "react";
import API from "../api/api";

const ResumeUpload = () => {
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a PDF file");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);

    try {
      setLoading(true);

      const res = await API.post("/resume/extract", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setText(res.data.text);
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "30px" }}>
      <h2>Upload Resume</h2>

      <input
        type="file"
        accept=".pdf"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <br /><br />

      <button onClick={handleUpload}>Upload & Extract</button>

      {loading && <p>Extracting text from PDF...</p>}

      {text && (
        <div style={{ marginTop: "20px" }}>
          <h3>Extracted Text:</h3>
          <pre style={{ whiteSpace: "pre-wrap", fontSize: "14px" }}>
            {text}
          </pre>
        </div>
      )}
    </div>
  );
};

export default ResumeUpload;