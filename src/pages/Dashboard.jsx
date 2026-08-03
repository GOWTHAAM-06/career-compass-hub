import { useState, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ResumeContext } from "../context/ResumeContext";
import API from "../api/api";
import "./Dashboard.css";

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const { resumeState, setResumeData } = useContext(ResumeContext);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [fileName, setFileName] = useState(resumeState.fileName || "");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [status, setStatus] = useState("idle"); // idle | uploading | extracting | done | error
  const [error, setError] = useState("");

  const firstName = (user?.name || user?.email || "User").split(" ")[0];

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError("Only PDF files are allowed.");
      setFileName("");
      e.target.value = "";
      return;
    }

    setFileName(file.name);
    setError("");
    setStatus("idle");
  };

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setError("Please choose a PDF resume to upload first.");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);

    try {
      setUploading(true);
      setError("");
      setStatus("uploading");
      setUploadProgress(0);

      // Simulated progress so the user sees a live upload status
      const progressTimer = setInterval(() => {
        setUploadProgress((p) => (p >= 90 ? p : p + 10));
      }, 300);

      // NOTE: Do NOT set Content-Type manually. Axios/browser must set it
      // with the correct multipart boundary, or Multer cannot parse the file.
      const res = await API.post("/resume/extract", formData);

      clearInterval(progressTimer);
      setUploadProgress(100);
      setStatus("done");

      // Persist extracted skills + categories into shared resume context
      setResumeData({
        fileName: file.name,
        skillList: res.data.skills || [],
        categories: res.data.categories || {},
        text: res.data.text || "",
        resumeId: res.data.resumeId || null,
      });
    } catch (err) {
      console.error(err);
      setStatus("error");
      setError(err.response?.data?.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleExtractNavigator = () => {
    if (resumeState.skillList.length > 0 || status === "done") {
      navigate("/extract-skills");
    } else {
      setError("Please upload your resume first to extract skills.");
    }
  };

  const progressLabel =
    status === "uploading"
      ? `Uploading… ${uploadProgress}%`
      : status === "extracting"
      ? "Extracting skills…"
      : status === "done"
      ? "Upload complete! Skills extracted."
      : "";

  return (
    <div className="dashboard-page">
      {/* Hero banner */}
      <section className="dash-hero glass-card">
        <div className="dash-hero-content">
          <p className="dash-hero-eyebrow">Welcome back{firstName ? `, ${firstName}` : ""} 👋</p>
          <h1 className="dash-hero-title">
            Your Career, <span>Guided.</span>
          </h1>
          <p className="dash-hero-subtitle">
            Career Compass Hub helps you turn your resume into a personalized career
            roadmap — upload your PDF, extract your skills, and find your best-fit job
            matches in seconds.
          </p>
          <div className="dash-hero-stats">
            <div className="stat-chip">
              <span className="stat-icon">📄</span>
              <div>
                <p className="stat-value">1</p>
                <p className="stat-label">Upload Resume</p>
              </div>
            </div>
            <div className="stat-chip">
              <span className="stat-icon">🧠</span>
              <div>
                <p className="stat-value">2</p>
                <p className="stat-label">AI Skill Extraction</p>
              </div>
            </div>
            <div className="stat-chip">
              <span className="stat-icon">🎯</span>
              <div>
                <p className="stat-value">3</p>
                <p className="stat-label">Job Match Center</p>
              </div>
            </div>
          </div>
        </div>
        <div className="dash-hero-art">🧭</div>
      </section>

      {/* Upload zone */}
      <section className="upload-zone glass-card">
        <h2 className="upload-zone-title">Upload Your Resume</h2>
        <p className="upload-zone-subtitle">
          Drag & drop your PDF, or click to browse
        </p>

        <div className="drop-zone">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            id="resume-file-input"
          />
          <label htmlFor="resume-file-input" className="drop-label">
            <span className="drop-icon">📎</span>
            <span className="drop-text">
              {fileName ? fileName : "Choose a PDF file"}
            </span>
          </label>
        </div>

        {error && <p className="upload-zone-error">{error}</p>}

        {(uploading || status === "uploading") && (
          <div className="upload-progress">
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="progress-label">{progressLabel}</p>
          </div>
        )}

        {status === "done" && (
          <p className="upload-success">
            ✓ {fileName} uploaded — skills are ready for extraction!
          </p>
        )}

        <div className="upload-actions">
          <button
            className="gradient-btn"
            onClick={handleUpload}
            disabled={uploading}
          >
            {uploading ? "Uploading…" : "Upload Resume"}
          </button>
          <button
            className="secondary-btn"
            onClick={handleExtractNavigator}
            disabled={uploading}
          >
            Extract Skills →
          </button>
        </div>
      </section>

      {/* Quick insight cards */}
      <section className="dash-cards">
        <div className="dash-card glass-card">
          <span className="dash-card-icon">🧠</span>
          <h3>Skill Extraction</h3>
          <p>
            We automatically organize your skills into Languages, Frameworks,
            Tools, and more.
          </p>
        </div>
        <div className="dash-card glass-card">
          <span className="dash-card-icon">🎯</span>
          <h3>Job Matching</h3>
          <p>
            Get real-time match percentages and trust scores for 12+ career paths.
          </p>
        </div>
        <div className="dash-card glass-card">
          <span className="dash-card-icon">🚀</span>
          <h3>Fast Apply</h3>
          <p>
            Launch directly to LinkedIn, Naukri, Glassdoor, and more from the Match
            Center.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;