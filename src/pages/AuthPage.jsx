import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import { AuthContext } from "../context/AuthContext";
import "./AuthPage.css";

const ACADEMIC_ROLES = ["First-Year", "Final-Year", "PG Student", "Researcher"];

const AuthPage = () => {
  const [mode, setMode] = useState("signin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [signinData, setSigninData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    academicRole: "First-Year",
  });

  const handleSigninChange = (e) => {
    setSigninData({ ...signinData, [e.target.name]: e.target.value });
  };

  const handleSignupChange = (e) => {
    setSignupData({ ...signupData, [e.target.name]: e.target.value });
  };

  const handleSignin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await API.post("/auth/login", signinData);
      localStorage.setItem("token", res.data.token);
      login(res.data.user);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (signupData.password !== signupData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await API.post("/auth/signup", {
        name: signupData.name,
        email: signupData.email,
        password: signupData.password,
      });

      // Store academic role for later profile enrichment
      localStorage.setItem(
        "pendingAcademicRole",
        JSON.stringify(signupData.academicRole)
      );

      setError("");
      setMode("signin");
      setSigninData({ email: signupData.email, password: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setError("");
  };

  return (
    <div className="auth-page">
      <div className="auth-orb auth-orb-1" />
      <div className="auth-orb auth-orb-2" />
      <div className="auth-orb auth-orb-3" />

      <div className="auth-brand">
        <div className="auth-logo">🧭</div>
        <h1>Career Compass Hub</h1>
        <p>Navigate your academic journey into a thriving career</p>
      </div>

      <div className="auth-card glass-card">
        <div className="auth-tabs">
          <button
            className={`auth-tab ${mode === "signin" ? "active" : ""}`}
            onClick={() => switchMode("signin")}
          >
            Sign In
          </button>
          <button
            className={`auth-tab ${mode === "signup" ? "active" : ""}`}
            onClick={() => switchMode("signup")}
          >
            Sign Up
          </button>
        </div>

        {error && <div className="auth-error">{error}</div>}

        {mode === "signin" ? (
          <form className="auth-form" onSubmit={handleSignin}>
            <div className="field-group">
              <label htmlFor="signin-email">Email</label>
              <input
                id="signin-email"
                type="email"
                name="email"
                placeholder="you@example.com"
                required
                autoComplete="email"
                value={signinData.email}
                onChange={handleSigninChange}
              />
            </div>

            <div className="field-group">
              <label htmlFor="signin-password">Password</label>
              <input
                id="signin-password"
                type="password"
                name="password"
                placeholder="••••••••"
                required
                autoComplete="current-password"
                value={signinData.password}
                onChange={handleSigninChange}
              />
            </div>

            <button type="submit" className="gradient-btn auth-submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleSignup}>
            <div className="field-group">
              <label htmlFor="signup-name">Full Name</label>
              <input
                id="signup-name"
                type="text"
                name="name"
                placeholder="Jane Doe"
                required
                autoComplete="name"
                value={signupData.name}
                onChange={handleSignupChange}
              />
            </div>

            <div className="field-group">
              <label htmlFor="signup-email">Email</label>
              <input
                id="signup-email"
                type="email"
                name="email"
                placeholder="you@example.com"
                required
                autoComplete="email"
                value={signupData.email}
                onChange={handleSignupChange}
              />
            </div>

            <div className="field-group">
              <label htmlFor="signup-role">Academic Role</label>
              <select
                id="signup-role"
                name="academicRole"
                value={signupData.academicRole}
                onChange={handleSignupChange}
              >
                {ACADEMIC_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>

            <div className="field-group">
              <label htmlFor="signup-password">Password</label>
              <input
                id="signup-password"
                type="password"
                name="password"
                placeholder="Min 6 characters"
                required
                autoComplete="new-password"
                minLength={6}
                value={signupData.password}
                onChange={handleSignupChange}
              />
            </div>

            <div className="field-group">
              <label htmlFor="signup-confirm">Confirm Password</label>
              <input
                id="signup-confirm"
                type="password"
                name="confirmPassword"
                placeholder="Re-enter password"
                required
                autoComplete="new-password"
                value={signupData.confirmPassword}
                onChange={handleSignupChange}
              />
            </div>

            <button type="submit" className="gradient-btn auth-submit" disabled={loading}>
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthPage;