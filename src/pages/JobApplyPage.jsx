import { useParams, useNavigate } from "react-router-dom";
import "./JobApplyPage.css";

const DIRECT_PORTALS = [
  {
    name: "Greenhouse / Lever",
    icon: "🏢",
    color: "#10b981",
    buildUrl: (q) =>
      `https://www.google.com/search?q=${encodeURIComponent(
        `site:boards.greenhouse.io OR site:jobs.lever.co "${q}"`
      )}`,
    tip: "Google search operator for all Greenhouse/Lever ATS boards",
  },
  {
    name: "Google Careers",
    icon: "🔍",
    color: "#4285f4",
    buildUrl: (q) =>
      `https://www.google.com/about/careers/applications/jobs/results/?q=${encodeURIComponent(q)}`,
    tip: "Official Google careers portal with direct listings",
  },
  {
    name: "Microsoft Careers",
    icon: "🪟",
    color: "#0f6cbd",
    buildUrl: (q) =>
      `https://jobs.careers.microsoft.com/global/en/search?q=${encodeURIComponent(q)}`,
    tip: "Official Microsoft careers portal",
  },
  {
    name: "Amazon Jobs",
    icon: "📦",
    color: "#ff9900",
    buildUrl: (q) =>
      `https://www.amazon.jobs/en/search?base_query=${encodeURIComponent(q)}`,
    tip: "Official Amazon jobs portal with base query search",
  },
  {
    name: "Zoho Careers",
    icon: "🌐",
    color: "#e42527",
    buildUrl: (q) =>
      `https://www.zoho.com/careers/jobdetails?jobid=${encodeURIComponent(q)}`,
    tip: "Zoho career portal for direct openings",
  },
  {
    name: "TCS Careers",
    icon: "💼",
    color: "#005f9e",
    buildUrl: (q) =>
      `https://ibegin.tcs.com/iBegin/jobs/searchresults?jobName=${encodeURIComponent(q)}`,
    tip: "TCS iBegin portal for direct job search",
  },
  {
    name: "Infosys Careers",
    icon: "🏛️",
    color: "#0057a8",
    buildUrl: (q) =>
      `https://career.infosys.com/joblist?q=${encodeURIComponent(q)}`,
    tip: "Infosys career portal for direct openings",
  },
];

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

      {/* ---------- DIRECT ATS & COMPANY CAREER HUBS ---------- */}
      <section className="direct-portals-section">
        <div className="direct-portals-header">
          <h2 className="direct-portals-title">
            Direct ATS & Company Career Hubs
          </h2>
          <p className="direct-portals-subtitle">
            Skip LinkedIn/Naukri traffic — apply directly on official company
            portals
          </p>
        </div>

        <div className="direct-portals-benefit glass-card">
          <span className="benefit-icon">⚡</span>
          <p>
            Direct apply portals increase response rates by cutting through
            high-volume job aggregator traffic.
          </p>
        </div>

        <div className="apply-grid direct-grid">
          {DIRECT_PORTALS.map((portal) => {
            const url = portal.buildUrl(decodedTitle);
            return (
              <a
                key={portal.name}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="apply-card glass-card direct-card"
                style={{ "--platform-color": portal.color }}
              >
                <div className="apply-card-top">
                  <span className="apply-icon">{portal.icon}</span>
                  <span className="apply-badge" style={{ background: portal.color }}>
                    {portal.name}
                  </span>
                </div>

                <p className="apply-tip">{portal.tip}</p>

                <div className="apply-url-preview">
                  {url.replace(/^https?:\/\//, "").split("/")[0]}
                </div>

                <span className="apply-launch-btn">Open Portal →</span>
              </a>
            );
          })}
        </div>
      </section>

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