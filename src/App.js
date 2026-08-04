import { Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import ExtractSkills from "./pages/ExtractSkills";
import Recommendations from "./pages/Recommendations";
import SkillGapPage from "./pages/SkillGapPage";
import JobApplyPage from "./pages/JobApplyPage";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      {/* Auth landing */}
      <Route path="/login" element={<AuthPage />} />
      <Route path="/auth" element={<AuthPage />} />

      {/* Redirect old routes */}
      <Route path="/signup" element={<Navigate to="/login" replace />} />
      <Route
        path="/dashboard"
        element={<Navigate to="/" replace />}
      />
      <Route
        path="/resume"
        element={<Navigate to="/" replace />}
      />

      {/* Protected app shell with header/drawer */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/extract-skills" element={<ExtractSkills />} />
        <Route path="/recommendations" element={<Recommendations />} />
        <Route path="/skill-gap/:jobTitle" element={<SkillGapPage />} />
        <Route path="/apply/:jobTitle" element={<JobApplyPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;