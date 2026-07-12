import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../lib/useAuth";

export default function ProtectedRoute({ children }) {
  const { autenticado } = useAuth();

  if (!autenticado) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
