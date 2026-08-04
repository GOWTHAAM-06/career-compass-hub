import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import ProfileFormFields, {
  DEFAULT_PROFILE_DATA,
} from "./ProfileFormFields";
import "./AppHeader.css";

const AppHeader = () => {
  const { user, logout, updateProfile } = useContext(AuthContext);
  const navigate = useNavigate();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  const profile = user?.profile || {};

  const [profileForm, setProfileForm] = useState({
    ...DEFAULT_PROFILE_DATA,
    ...profile,
  });

  // Hydrate the form whenever the drawer opens with current profile values
  const openDrawer = () => {
    const current = user?.profile || {};
    setProfileForm({
      ...DEFAULT_PROFILE_DATA,
      ...current,
    });
    setProfileSaved(false);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
  };

  const handleProfileChange = (updatedProfile) => {
    setProfileForm(updatedProfile);
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
          <ProfileFormFields
            profile={profileForm}
            onChange={handleProfileChange}
          />

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