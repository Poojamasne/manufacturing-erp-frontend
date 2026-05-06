import type { RouteObject } from "react-router-dom";
import { Navigate } from "react-router-dom";
import { lazy } from "react";

import ProtectedRoute from "../../features/auth/ProtectedRoute";
import InventoryLayout from "../../features/inventory/layout/InventoryLayout";
import { withSuspense } from "./routeUtils";

const InventoryDashboard = lazy(
  () => import("../../features/inventory/pages/InventoryDashboard")
);

export const inventoryRoutes: RouteObject[] = [
  {
    path: "/inventory",
    element: <ProtectedRoute requiredRole={["Inventory Manager"]} />,
    children: [
      {
        element: <InventoryLayout />,
        children: [
          { index: true, element: <Navigate to="/inventory/dashboard" replace /> },
          { path: "dashboard", element: withSuspense(<InventoryDashboard />) },
        ],
      },
    ],
  },
];
