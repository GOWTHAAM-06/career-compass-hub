import { createContext, useState, useCallback } from "react";

export const AuthContext = createContext();

const DEFAULT_PROFILE = {
  academicLevel: "First-Year",
  targetDomain: "",
  researchInterests: "",
  graduationYear: "",
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
    setUser(enriched);
    localStorage.setItem("user", JSON.stringify(enriched));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const updateProfile = useCallback(
    (profilePatch) => {
      setUser((prev) => {
        if (!prev) return prev;
        const updated = {
          ...prev,
          profile: { ...DEFAULT_PROFILE, ...(prev.profile || {}), ...profilePatch },
        };
        localStorage.setItem("user", JSON.stringify(updated));
        return updated;
      });
    },
    []
  );

  // If token exists but user is null (e.g., token from old session), keep empty
  // The 401 interceptor in api.js handles invalid token auto-logout.

  return (
    <AuthContext.Provider value={{ user, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};