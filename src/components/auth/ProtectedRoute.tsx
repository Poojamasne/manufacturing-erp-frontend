import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

interface ProtectedRouteProps {
  requiredRole: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredRole }) => {
  const [isAllowed, setIsAllowed] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("userRole");

    setIsAllowed(!!token && role === requiredRole);
  }, [location, requiredRole]);

  if (isAllowed === null) return <div>Checking access...</div>;

  return isAllowed ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;