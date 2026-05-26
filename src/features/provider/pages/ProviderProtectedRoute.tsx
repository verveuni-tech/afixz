import { Navigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

export default function ProviderProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isProvider, isAdmin, loading } = useAuth();

  if (loading) return null;

  if (!user || (!isProvider && !isAdmin)) {
    return <Navigate to="/provider/login" replace />;
  }

  return <>{children}</>;
}
