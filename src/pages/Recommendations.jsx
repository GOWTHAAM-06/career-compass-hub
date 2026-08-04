import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ResumeContext } from "../context/ResumeContext";
import API from "../api/api";
import "./Recommendations.css";

const LAUNCHPAD = [
  { name: "LinkedIn", icon: "💼", url: "https://www.linkedin.com/jobs" },
  { name: "Naukri", icon: "🏢", url: "https://www.naukri.com" },
  { name: "Glassdoor", icon: "🏠", url: "https://www.glassdoor.com/Job" },
  { name: "Indeed", icon: "🔍", url: "https://www.indeed.com" },
  { name: "Wellfound", icon: "🚀", url: "https://wellfound.com" },
  { name: "Monster", icon: "👾", url: "https://www.monster.com" },
  { name: "SimplyHired", icon: "📋", url: "https://www.simplyhired.com" },
];

const Recommendations = () => {
  const { resumeState } = useContext(ResumeContext);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [gaugeAngle, setGaugeAngle] = useState(0);

  const hasSkills = resumeState.skillList?.length > 0;
  const topMatch = recommendations[0] || null;

  // Animate the top-match gauge needle on mount or when topMatch changes
  useEffect(() => {
    if (!topMatch) return;

    const targetAngle = Math.min(180, Math.round((topMatch.match / 100) * 180));
    let current = 0;
    const timer = setInterval(() => {
      current += Math.max(1, Math.round(targetAngle / 25));
      if (current >= targetAngle) {
        current = targetAngle;
        clearInterval(timer);
      }
      setGaugeAngle(current);
    }, 50);
    return () => clearInterval(timer);
  }, [topMatch]);

  const handleFetchRecommendations = async () => {
    if (!hasSkills && !resumeState.resumeId) {
      setError("Please extract your skills first before analyzing job matches.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await API.get("/jobs/recommendations");
      const recs = res.data.recommendations || [];

      setRecommendations(recs);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Failed to fetch recommendations. Please try again."
      );
      // Graceful: if there are recommendations already loaded (e.g. from a previous fetch), keep them.
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch on mount if skills are available
  useEffect(() => {
    if (hasSkills || resumeState.resumeId) {
      handleFetchRecommendations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const gaugeColor =
    !topMatch || topMatch.match >= 70
      ? "#34d399"
      : topMatch.match >= 45
      ? "#fbbf24"
      : "#f87171";

  return (
    <div className="recs-page">
      {/* Page header */}
      <div className="recs-header">
        <div>
          <h1>Match Center</h1>
          <p className="recs-subtitle">
            Your personalized job matches, powered by your extracted skills
          </p>
        </div>
        <button
          className="gradient-btn"
          onClick={handleFetchRecommendations}
          disabled={loading}
        >
          {loading ? "Analyzing…" : "Refresh Matches"}
        </button>
      </div>

      {error && <div className="recs-error">{error}</div>}

      {loading && recommendations.length === 0 && (
        <div className="recs-loading glass-card">
          <div className="loading-spinner" />
          <p>🔍 Matching your skills against career tracks…</p>
        </div>
      )}

      {/* ---------- TOP MATCH HERO (Speedometer) ---------- */}
      {topMatch && !loading && (
        <section className="top-match-hero glass-card">
          <div className="gauge-container">
            <div className="speedometer">
              <div
                className="gauge-arc"
                style={{ "--gauge-angle": `${gaugeAngle}deg`, "--gauge-color": gaugeColor }}
              >
                <div className="gauge-face">
                  <span className="gauge-value">{topMatch.match}%</span>
                  <span className="gauge-label">Match</span>
                </div>
              </div>
              <div className="gauge-ticks">
                {[0, 25, 50, 75, 100].map((t) => (
                  <span key={t} className="gauge-tick-label">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="top-match-info">
            <h2 className="top-match-title">{topMatch.title}</h2>
            <p className="top-match-desc">
              Your strongest career fit based on skill overlap analysis.
            </p>

            <div className="top-match-scores">
              <div className="score-chip">
                <span className="score-chip-value">{topMatch.match}%</span>
                <span className="score-chip-label">Match</span>
              </div>
              <div className="score-chip">
                <span className="score-chip-value">{topMatch.trust}%</span>
                <span className="score-chip-label">Trust</span>
              </div>
            </div>

            <div className="verified-badge">
              ✅ Verified Eligibility
            </div>

            {topMatch.matchedSkills?.length > 0 && (
              <div className="match-skills-block">
                <p className="match-skills-label">Matched Skills</p>
                <div className="match-skill-pills">
                  {topMatch.matchedSkills.slice(0, 8).map((skill, i) => (
                    <span key={i} className="match-pill matched">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ---------- SECONDARY MATCH CARDS ---------- */}
      {recommendations.length > 1 && !loading && (
        <section className="secondary-section">
          <h3 className="section-title">Other Strong Matches</h3>
          <div className="secondary-grid">
            {recommendations.slice(1).map((job, index) => (
              <div key={index} className="rec-card glass-card">
                <div className="rec-card-header">
                  <h4>{job.title}</h4>
                  <span className="rec-card-match">{job.match}%</span>
                </div>

                <div className="rec-progress">
                  <div className="rec-progress-track">
                    <div
                      className="rec-progress-fill"
                      style={{ width: `${job.match}%` }}
                    />
                  </div>
                  <div className="rec-progress-labels">
                    <span>Match {job.match}%</span>
                    <span>Trust {job.trust}%</span>
                  </div>
                </div>

                {job.matchedSkills?.length > 0 && (
                  <div className="rec-card-skills">
                    <p className="rec-card-label">Matched</p>
                    <div className="rec-pills">
                      {job.matchedSkills.slice(0, 4).map((skill, i) => (
                        <span key={i} className="match-pill matched small">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {job.missingSkills?.length > 0 && (
                  <div className="rec-card-skills">
                    <p className="rec-card-label">Improve</p>
                    <div className="rec-pills">
                      {job.missingSkills.slice(0, 4).map((skill, i) => (
                        <span key={i} className="match-pill missing small">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ---------- Empty / not-loaded state ---------- */}
      {!loading && recommendations.length === 0 && !error && (
        <div className="empty-state glass-card">
          <span className="empty-icon">🎯</span>
          <h2>No matches yet</h2>
          <p>
            Upload your resume and extract your skills first, then come back here
            to see your top career matches.
          </p>
          <button className="gradient-btn" onClick={() => navigate("/")}>
            Go to Dashboard
          </button>
        </div>
      )}

      {/* ---------- PLATFORM LAUNCHPAD ---------- */}
      <section className="launchpad glass-card">
        <h3 className="launchpad-title">Quick Apply via</h3>
        <div className="launchpad-grid">
          {LAUNCHPAD.map((platform) => (
            <a
              key={platform.name}
              href={platform.url}
              target="_blank"
              rel="noopener noreferrer"
              className="launchpad-item"
              title={`Search ${platform.name} for ${topMatch?.title || "jobs"}`}
            >
              <span className="launchpad-icon">{platform.icon}</span>
              <span className="launchpad-name">{platform.name}</span>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Recommendations;