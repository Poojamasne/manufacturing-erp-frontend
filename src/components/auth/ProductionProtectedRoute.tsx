import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

interface ProductionProtectedRouteProps {
  requiredRoles: string[];
}

const ProductionProtectedRoute: React.FC<ProductionProtectedRouteProps> = ({ requiredRoles }) => {
  const location = useLocation();
  
  // Synchronous check - no effect needed
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("designation");
  const isAllowed = !!token && role && requiredRoles.includes(role);

  return isAllowed ? <Outlet /> : <Navigate to="/" replace state={{ from: location }} />;
};

export default ProductionProtectedRoute;