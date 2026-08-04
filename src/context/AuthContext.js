import { createContext, useState, useCallback } from "react";
import { DEFAULT_PROFILE_DATA } from "../components/ProfileFormFields";

export const AuthContext = createContext();

const DEFAULT_PROFILE = {
  ...DEFAULT_PROFILE_DATA,
};

export const AuthProvider = ({ children }) => {
  // Restore user from localStorage on refresh
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const login = (userData) => {
    const enriched = {
      ...userData,
      profile: {
        ...DEFAULT_PROFILE,
        ...(userData.profile || {}),
      },
    };

    // Migrate legacy "academicLevel" field to the new cascading structure
    if (!enriched.profile.primaryRole && enriched.profile.academicLevel) {
      const legacy = enriched.profile.academicLevel;
      if (
        ["First-Year", "Final-Year"].includes(legacy) ||
        legacy.includes("Year") ||
        legacy.includes("ITI") ||
        legacy.includes("Diploma")
      ) {
        enriched.profile.primaryRole = "Student";
        enriched.profile.level = "Undergraduate (UG)";
      } else if (legacy === "PG Student") {
        enriched.profile.primaryRole = "Student";
        enriched.profile.level = "Postgraduate (PG)";
      } else if (legacy === "Researcher") {
        enriched.profile.primaryRole = "Student";
        enriched.profile.level = "Research Scholar";
      }
      delete enriched.profile.academicLevel;
    }

    if (!enriched.profile.primaryRole) {
      enriched.profile.primaryRole = "Student";
      enriched.profile.level = "Undergraduate (UG)";
    }

    setUser(enriched);
    localStorage.setItem("user", JSON.stringify(enriched));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const updateProfile = useCallback((profilePatch) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        profile: {
          ...DEFAULT_PROFILE,
          ...(prev.profile || {}),
          ...profilePatch,
        },
      };
      localStorage.setItem("user", JSON.stringify(updated));
      return updated;
    });
  }, []);

  // If token exists but user is null (e.g., token from old session), keep empty
  // The 401 interceptor in api.js handles invalid token auto-logout.

  return (
    <AuthContext.Provider value={{ user, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};