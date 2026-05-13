import type { RouteObject } from "react-router-dom";
import { lazy } from "react";

import ProtectedRoute from "../../features/auth/ProtectedRoute";
import InventoryLayout from "../../features/purchase management/layout/PurchaseManagerLayout";
import { withSuspense } from "./routeUtils";

const PurchaseDashboard = lazy(
  () => import("../../features/purchase management/components/Dashboard/Dashboard")
);

export const purchaseRoutes: RouteObject[] = [
  {
    path: "/purchase",
    element: <ProtectedRoute requiredRole={["Purchase Manager","purchase_manager", "Admin"]} />,
    children: [
      {
        element: <InventoryLayout />,
        children: [
          { index: true, element: <PurchaseDashboard /> },
          { path: "dashboard", element: withSuspense(<PurchaseDashboard />) },
        ],
      },
    ],
  },
];