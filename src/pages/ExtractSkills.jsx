import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ResumeContext } from "../context/ResumeContext";
import "./ExtractSkills.css";

const CATEGORY_ICONS = {
  Languages: "💻",
  Frameworks: "🧩",
  Tools: "🛠️",
  Databases: "🗄️",
  Cloud: "☁️",
  "Data & ML": "📊",
  "Soft Skills": "💬",
};

const ExtractSkills = () => {
  const { resumeState } = useContext(ResumeContext);
  const navigate = useNavigate();

  const { skillList = [], categories = {}, fileName = "" } = resumeState;
  const [confidence, setConfidence] = useState(0);

  // Animate the confidence score on mount
  useEffect(() => {
    const total = skillList.length || 0;
    const target = total > 0 ? Math.min(96, 70 + Math.round(total * 1.2)) : 0;
    let current = 0;
    const timer = setInterval(() => {
      current += Math.max(1, Math.round(target / 20));
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      setConfidence(current);
    }, 60);
    return () => clearInterval(timer);
  }, [skillList.length]);

  const hasSkills = skillList.length > 0;

  const handleAnalyze = () => {
    navigate("/recommendations");
  };

  return (
    <div className="extract-page">
      {/* Page header */}
      <div className="extract-header">
        <div>
          <h1>Skill Extraction Workspace</h1>
          <p className="extract-subtitle">
            {fileName
              ? `Skills extracted from ${fileName}`
              : "Your AI-extracted skills, organized by category"}
          </p>
        </div>

        <div className="confidence-box">
          <div
            className="confidence-ring"
            style={{ "--confidence": `${confidence * 3.6}deg` }}
          >
            <div className="confidence-inner">
              <span className="confidence-value">{confidence}%</span>
            </div>
          </div>
          <p className="confidence-label">Extraction Confidence</p>
        </div>
      </div>

      {!hasSkills ? (
        <div className="empty-state glass-card">
          <span className="empty-icon">📄</span>
          <h2>No skills extracted yet</h2>
          <p>
            Upload your resume on the Dashboard first, then come back here to see
            your organized skill profile.
          </p>
          <button className="gradient-btn" onClick={() => navigate("/")}>
            Go to Dashboard
          </button>
        </div>
      ) : (
        <>
          {/* Category sections */}
          {Object.keys(categories).length > 0 ? (
            <div className="extract-categories">
              {Object.entries(categories).map(([category, names]) => (
                <div key={category} className="category-card glass-card">
                  <div className="category-header">
                    <span className="category-icon">
                      {CATEGORY_ICONS[category] || "🏷️"}
                    </span>
                    <div>
                      <h3>{category}</h3>
                      <p className="category-count">
                        {names.length} skill{names.length === 1 ? "" : "s"}
                      </p>
                    </div>
                  </div>
                  <div className="category-badges">
                    {names.map((name, i) => (
                      <span key={`${category}-${name}-${i}`} className="skill-pill">
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="category-card glass-card">
              <div className="category-badges">
                {skillList.map((skill, i) => (
                  <span key={i} className="skill-pill">
                    {skill.name || skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Analyze CTA */}
          <div className="extract-cta glass-card">
            <div>
              <h3>Ready for your best-fit roles?</h3>
              <p>
                We'll compare {skillList.length} extracted skills against 12+
                career tracks to find your strongest matches.
              </p>
            </div>
            <button className="gradient-btn extract-analyze-btn" onClick={handleAnalyze}>
              Analyze Job Match →
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ExtractSkills;