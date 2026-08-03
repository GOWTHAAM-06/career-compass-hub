import { useState, useContext } from "react";
import "./Dashboard.css";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [resume, setResume] = useState(null);
  const [skills, setSkills] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    setResume(e.target.files[0]);
    setError("");
  };

  const handleExtractSkills = async () => {
    if (!resume) {
      alert("Please upload your resume first");
      return;
    }

    const formData = new FormData();
    formData.append("resume", resume);

    try {
      setLoading(true);
      setError("");

      const res = await API.post("/resume/extract", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Backend now returns { text, resumeId } — store raw extracted text
      // For now, keep the full text; future AI parsing will split into skills
      setSkills([res.data.text]);
    } catch (error) {
      console.error(error);
      setError("Extraction failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewJobs = () => {
    if (skills.length === 0) {
      alert("Extract skills first");
      return;
    }

    setJobs([
      {
        title: "Data Analyst",
        match: "82%",
        trust: "90%",
      },
      {
        title: "Machine Learning Intern",
        match: "76%",
        trust: "88%",
      },
    ]);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Welcome {user?.name || user?.email || "User"} 👋</h2>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <p className="subtitle">
        Upload your resume and let AI analyze your profile
      </p>

      <div className="upload-box">
        <input type="file" accept=".pdf" onChange={handleFileChange} />
        {resume && <p className="file-name">{resume.name}</p>}
      </div>

      {error && <p className="error-message">{error}</p>}

      <div className="action-buttons">
        {loading && <p>🤖 AI is analyzing your resume...</p>}

        <button onClick={handleExtractSkills} disabled={loading}>
          Extract Skills
        </button>
        <button className="secondary" onClick={handleViewJobs} disabled={loading}>
          View Job Recommendations
        </button>
      </div>

      {skills.length > 0 && (
        <div className="skills-section">
          <h3>Extracted Skills</h3>
          <div className="skills-list">
            {skills.map((skill, index) => (
              <span key={index}>{skill}</span>
            ))}
          </div>
        </div>
      )}

      {jobs.length > 0 && (
        <div className="jobs-section">
          <h3>Recommended Jobs</h3>
          {jobs.map((job, index) => (
            <div key={index} className="job-card">
              <h4>{job.title}</h4>
              <p>Match: {job.match}</p>
              <p>Trust Score: {job.trust}✅ Verified</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;