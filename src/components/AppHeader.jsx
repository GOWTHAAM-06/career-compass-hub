import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "./AppHeader.css";

const ACADEMIC_ROLES = ["First-Year", "Final-Year", "PG Student", "Researcher"];

const AppHeader = () => {
  const { user, logout, updateProfile } = useContext(AuthContext);
  const navigate = useNavigate();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  const profile = user?.profile || {};

  const [profileForm, setProfileForm] = useState({
    academicLevel: profile.academicLevel || "First-Year",
    targetDomain: profile.targetDomain || "",
    researchInterests: profile.researchInterests || "",
    graduationYear: profile.graduationYear || "",
  });

  // Hydrate the form whenever the drawer opens with current profile values
  const openDrawer = () => {
    const current = user?.profile || {};
    setProfileForm({
      academicLevel: current.academicLevel || "First-Year",
      targetDomain: current.targetDomain || "",
      researchInterests: current.researchInterests || "",
      graduationYear: current.graduationYear || "",
    });
    setProfileSaved(false);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
  };

  const handleProfileChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateProfile(profileForm);
    setProfileSaved(true);
  };

  const openLogoutModal = () => {
    closeDrawer();
    setLogoutModalOpen(true);
  };

  const closeLogoutModal = () => {
    setLogoutModalOpen(false);
  };

  const confirmLogout = () => {
    closeLogoutModal();
    logout();
    navigate("/login");
  };

  const firstName = (user?.name || user?.email || "User").split(" ")[0];

  return (
    <>
      {/* Fixed header */}
      <header className="app-header">
        <button
          className="hamburger-btn"
          onClick={openDrawer}
          aria-label="Open menu"
        >
          <span className="hamburger-line" />
          <span className="hamburger-line" />
          <span className="hamburger-line" />
        </button>

        <button
          className="header-logo"
          onClick={() => navigate("/")}
          aria-label="Career Compass Hub home"
        >
          <span className="header-logo-icon">🧭</span>
          <span className="header-logo-text">Career Compass</span>
        </button>

        <div className="header-greeting">
          <span className="greeting-wave">👋</span>
          <span className="greeting-name">
            Hi, {firstName}
          </span>
        </div>
      </header>

      {/* Slide-out drawer overlay */}
      <div
        className={`drawer-overlay ${drawerOpen ? "open" : ""}`}
        onClick={closeDrawer}
      />

      {/* Slide-out drawer */}
      <aside className={`app-drawer ${drawerOpen ? "open" : ""}`}>
        <div className="drawer-header">
          <h3>Profile</h3>
          <button className="drawer-close" onClick={closeDrawer} aria-label="Close menu">
            ✕
          </button>
        </div>

        <div className="drawer-user">
          <div className="drawer-avatar">
            {(user?.name || user?.email || "U").charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="drawer-name">{user?.name || "User"}</p>
            <p className="drawer-email">{user?.email || ""}</p>
          </div>
        </div>

        <form className="drawer-form" onSubmit={handleSaveProfile}>
          <div className="drawer-field">
            <label htmlFor="academicLevel">Academic Level</label>
            <select
              id="academicLevel"
              name="academicLevel"
              value={profileForm.academicLevel}
              onChange={handleProfileChange}
            >
              {ACADEMIC_ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          <div className="drawer-field">
            <label htmlFor="targetDomain">Target Domain</label>
            <input
              id="targetDomain"
              type="text"
              name="targetDomain"
              placeholder="e.g. Machine Learning, Full-Stack"
              value={profileForm.targetDomain}
              onChange={handleProfileChange}
            />
          </div>

          <div className="drawer-field">
            <label htmlFor="researchInterests">Research Interests</label>
            <textarea
              id="researchInterests"
              name="researchInterests"
              placeholder="e.g. NLP, Computer Vision, Distributed Systems"
              rows={3}
              value={profileForm.researchInterests}
              onChange={handleProfileChange}
            />
          </div>

          <div className="drawer-field">
            <label htmlFor="graduationYear">Graduation Year</label>
            <input
              id="graduationYear"
              type="text"
              name="graduationYear"
              placeholder="e.g. 2027"
              value={profileForm.graduationYear}
              onChange={handleProfileChange}
            />
          </div>

          {profileSaved && (
            <p className="drawer-saved">✓ Profile saved</p>
          )}

          <button type="submit" className="gradient-btn drawer-save-btn">
            Save Profile
          </button>
        </form>

        <div className="drawer-footer">
          <button className="logout-drawer-btn" onClick={openLogoutModal}>
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      {/* Logout confirmation modal */}
      {logoutModalOpen && (
        <div className="logout-modal-overlay" onClick={closeLogoutModal}>
          <div
            className="logout-modal glass-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="logout-modal-icon">💼</div>
            <h3>Leaving so soon?</h3>
            <p>
              We'll keep your career roadmap ready. See you back soon! 🚀
            </p>
            <div className="logout-modal-actions">
              <button className="secondary-btn" onClick={closeLogoutModal}>
                Stay
              </button>
              <button className="logout-confirm-btn" onClick={confirmLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AppHeader;