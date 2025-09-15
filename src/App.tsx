// src/App.tsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAppSelector } from "./app/hooks";
import Login from "./pages/Login";
import DashboardAdmin from "./pages/DashboardAdmin";
import DashboardCollector from "./pages/DashboardCollector";
import DashboardTranscriber from "./pages/DashboardTranscriber";
import DashboardValidator from "./pages/DashboardValidator";

const App: React.FC = () => {
  const auth = useAppSelector((state) => state.auth);
  const role = auth.role;

  const getDashboardPath = (role: typeof auth.role) => {
    switch (role) {
      case "admin":
        return "/dashboard/admin";
      case "datacollector":
        return "/dashboard/collector";
      case "transcriber":
        return "/dashboard/transcriber";
      case "validator":
        return "/dashboard/validator";
      default:
        return "/login";
    }
  };

  return (
    <Router>
      <Routes>
        {/* Login */}
        <Route
          path="/login"
          element={!auth.user ? <Login /> : <Navigate to={getDashboardPath(role)} replace />}
        />

        {/* Role-based dashboards */}
        <Route
          path="/dashboard/admin"
          element={auth.user && role === "admin" ? <DashboardAdmin /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/dashboard/collector"
          element={auth.user && role === "datacollector" ? <DashboardCollector /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/dashboard/transcriber"
          element={auth.user && role === "transcriber" ? <DashboardTranscriber /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/dashboard/validator"
          element={auth.user && role === "validator" ? <DashboardValidator /> : <Navigate to="/login" replace />}
        />

        {/* Default redirect */}
        <Route
          path="*"
          element={<Navigate to={auth.user ? getDashboardPath(role) : "/login"} replace />}
        />
      </Routes>
    </Router>
  );
};

export default App;
