import { useParams, useNavigate } from "react-router-dom";
import "./JobApplyPage.css";

const PLATFORMS = [
  {
    name: "LinkedIn",
    icon: "💼",
    color: "#0a66c2",
    buildUrl: (q) =>
      `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(q)}`,
    tip: "Use filters for location, experience level, and remote",
  },
  {
    name: "Naukri",
    icon: "🏢",
    color: "#ff6b35",
    buildUrl: (q) =>
      `https://www.naukri.com/${q.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-jobs`,
    tip: "Add your city and experience to narrow results",
  },
  {
    name: "Glassdoor",
    icon: "🏠",
    color: "#0caa41",
    buildUrl: (q) =>
      `https://www.glassdoor.com/Job/jobs.htm?sc.keyword=${encodeURIComponent(q)}`,
    tip: "Check company ratings and salary insights",
  },
  {
    name: "Indeed",
    icon: "🔍",
    color: "#2557a7",
    buildUrl: (q) => `https://www.indeed.com/jobs?q=${encodeURIComponent(q)}`,
    tip: "Sort by date posted for the freshest openings",
  },
  {
    name: "Wellfound",
    icon: "🚀",
    color: "#3d5afe",
    buildUrl: (q) => `https://wellfound.com/jobs?q=${encodeURIComponent(q)}`,
    tip: "Great for startup and early-stage roles",
  },
  {
    name: "SimplyHired",
    icon: "📋",
    color: "#e11d48",
    buildUrl: (q) => `https://www.simplyhired.com/search?q=${encodeURIComponent(q)}`,
    tip: "Compare salaries across multiple listings",
  },
  {
    name: "Monster",
    icon: "👾",
    color: "#6d28d9",
    buildUrl: (q) => `https://www.monster.com/jobs/search?q=${encodeURIComponent(q)}`,
    tip: "Upload your resume for recruiter visibility",
  },
];

const JobApplyPage = () => {
  const { jobTitle } = useParams();
  const navigate = useNavigate();

  const decodedTitle = decodeURIComponent(jobTitle || "");

  return (
    <div className="apply-page">
      {/* Header */}
      <div className="apply-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1>Job Board Apply Launchpad</h1>
        <p className="apply-subtitle">
          Search live openings for{" "}
          <strong className="apply-role">{decodedTitle}</strong> across top job
          platforms
        </p>
      </div>

      {/* Platform launcher cards */}
      <div className="apply-grid">
        {PLATFORMS.map((platform) => {
          const url = platform.buildUrl(decodedTitle);
          return (
            <a
              key={platform.name}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="apply-card glass-card"
              style={{ "--platform-color": platform.color }}
            >
              <div className="apply-card-top">
                <span className="apply-icon">{platform.icon}</span>
                <span className="apply-badge" style={{ background: platform.color }}>
                  {platform.name}
                </span>
              </div>

              <p className="apply-tip">{platform.tip}</p>

              <div className="apply-url-preview">
                {url.replace(/^https?:\/\//, "").split("/")[0]}
              </div>

              <span className="apply-launch-btn">Launch Search →</span>
            </a>
          );
        })}
      </div>

      {/* Tip banner */}
      <div className="apply-tip-banner glass-card">
        <span className="tip-icon">💡</span>
        <div>
          <h3>Pro Tip</h3>
          <p>
            Customize your resume for each application by highlighting the skills
            you matched. Use the Skill Gap page to see which skills to emphasize
            for <strong>{decodedTitle}</strong>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default JobApplyPage;