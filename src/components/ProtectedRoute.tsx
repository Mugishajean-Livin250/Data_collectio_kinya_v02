import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAppSelector } from "../app/hooks";

type Role = "admin" | "datacollector" | "transcriber" | "validator";

interface ProtectedRouteProps {
  children: ReactNode;
  allow?: Role[];
}

const ProtectedRoute = ({ children, allow }: ProtectedRouteProps) => {
  const token = useAppSelector((state) => state.auth.token);
  const role = useAppSelector((state) => state.auth.role as Role | null);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allow && role && !allow.includes(role)) {
    // Redirect to  correct dashboard depending on role
    const fallback =
      role === "admin"
        ? "/dashboard/admin"
        : role === "datacollector"
        ? "/dashboard/collector"
        : role === "transcriber"
        ? "/dashboard/transcriber"
        : "/dashboard/validator";

    return <Navigate to={fallback} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
