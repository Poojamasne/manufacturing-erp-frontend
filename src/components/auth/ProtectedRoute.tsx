import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

interface ProtectedRouteProps {
  requiredRole: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredRole }) => {
  console.log("Checking access for role:", requiredRole);
  const [isAllowed, setIsAllowed] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("designation");

    setIsAllowed(!!token && role === requiredRole);
  }, [location, requiredRole]);
  console.log("Access check result:", isAllowed);
  if (isAllowed === null)
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="text-xl text-green-400">Checking Access...</div>
      </div>
    );

  return isAllowed ? <Outlet /> : <Navigate to="/" replace />;
};

export default ProtectedRoute;
