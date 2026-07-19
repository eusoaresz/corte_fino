import { Navigate, useLocation } from "react-router-dom";
import { useClientAuth } from "../lib/useClientAuth";

export default function ClientProtectedRoute({ children }) {
  const { autenticado } = useClientAuth();
  const location = useLocation();
  return autenticado ? children : <Navigate to="/conta" state={{ from: location.pathname }} replace />;
}
