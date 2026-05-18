import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

interface ProtectedRouteProps {
  requiredRole: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredRole }) => {
  const location = useLocation();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("designation");
  const isAllowed = !!token && role !== null && requiredRole.includes(role);

  return isAllowed ? <Outlet /> : <Navigate to="/" replace state={{ from: location }} />;
};

export default ProtectedRoute;
