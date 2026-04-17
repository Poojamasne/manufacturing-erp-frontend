import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

interface ProductionProtectedRouteProps {
  requiredRoles: string[];
}

const ProductionProtectedRoute: React.FC<ProductionProtectedRouteProps> = ({ requiredRoles }) => {
  const [isAllowed, setIsAllowed] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("designation");
    
    const hasAccess = !!token && role && requiredRoles.includes(role);
    setIsAllowed(hasAccess);
  }, [location, requiredRoles]);

  if (isAllowed === null) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="text-xl text-green-400">Checking Access...</div>
      </div>
    );
  }

  return isAllowed ? <Outlet /> : <Navigate to="/" replace />;
};

export default ProductionProtectedRoute;