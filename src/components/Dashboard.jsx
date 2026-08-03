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
  const [categories, setCategories] = useState({});
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [jobsLoading, setJobsLoading] = useState(false);
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

      // NOTE: Do NOT set Content-Type manually. Axios/browser must set it
      // with the correct multipart boundary, or Multer cannot parse the file.
      const res = await API.post("/resume/extract", formData);

      // Backend returns { text, resumeId, skills, categories }
      // skills: [{ name, category }], categories: { Category: [names] }
      setSkills(res.data.skills || []);
      setCategories(res.data.categories || {});
    } catch (error) {
      console.error(error);
      setError("Extraction failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewJobs = async () => {
    if (skills.length === 0) {
      alert("Extract skills first");
      return;
    }

    try {
      setJobsLoading(true);
      setError("");

      // Fetch real-time dynamic job recommendations from the backend
      const res = await API.get("/jobs/recommendations");

      setJobs(res.data.recommendations || []);
    } catch (error) {
      console.error(error);
      setError(
        error.response?.data?.message ||
          "Failed to fetch job recommendations. Please try again."
      );
    } finally {
      setJobsLoading(false);
    }
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
        {jobsLoading && <p>🔍 Finding the best job matches for you...</p>}

        <button onClick={handleExtractSkills} disabled={loading || jobsLoading}>
          Extract Skills
        </button>
        <button
          className="secondary"
          onClick={handleViewJobs}
          disabled={loading || jobsLoading}
        >
          View Job Recommendations
        </button>
      </div>

      {skills.length > 0 && (
        <div className="skills-section">
          <h3>Extracted Skills</h3>

          {Object.keys(categories).length > 0 ? (
            Object.entries(categories).map(([category, skillNames]) => (
              <div key={category} className="skill-category">
                <h4 className="skill-category-title">{category}</h4>
                <div className="skills-list">
                  {skillNames.map((skillName, index) => (
                    <span
                      key={`${category}-${skillName}-${index}`}
                      className="skill-badge"
                    >
                      {skillName}
                    </span>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="skills-list">
              {skills.map((skill, index) => (
                <span key={index} className="skill-badge">
                  {skill.name || skill}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {jobs.length > 0 && (
        <div className="jobs-section">
          <h3>Recommended Jobs</h3>
          {jobs.map((job, index) => (
            <div key={index} className="job-card">
              <div className="job-card-header">
                <h4>{job.title}</h4>
                <span className="job-match-badge">{job.match}% Match</span>
              </div>
              <p className="job-trust">
                Trust Score: {job.trust}% ✅ Verified
              </p>
              {job.matchedSkills && job.matchedSkills.length > 0 && (
                <div className="job-skills">
                  <p className="job-skills-label">Matched Skills:</p>
                  <div className="skills-list">
                    {job.matchedSkills.map((skill, i) => (
                      <span key={i} className="skill-badge matched">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {job.missingSkills && job.missingSkills.length > 0 && (
                <div className="job-skills">
                  <p className="job-skills-label">Skills to Improve:</p>
                  <div className="skills-list">
                    {job.missingSkills.slice(0, 5).map((skill, i) => (
                      <span key={i} className="skill-badge missing">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;