import type { RouteObject } from "react-router-dom";
import { lazy } from "react";
import { withSuspense } from "./routeUtils";
import { ProtectedRoute } from "../../features/inventory/components/ProtectedRoute";
import { InventoryLayout } from "../../features/inventory/layout/InventoryLayout";

const InventoryDashboard = lazy(() => import("../../features/inventory/pages/InventoryDashboard"));
const MaterialReceipt = lazy(() => import("../../features/inventory/pages/MaterialReceipt"));
const MaterialIssueRequests = lazy(() => import("../../features/inventory/pages/MaterialIssueRequests"));

export const inventoryRoutes: RouteObject[] = [
  {
    path: "/inventory",
    element: (
      <ProtectedRoute allowedRoles={['INVENTORY_MANAGER', 'WAREHOUSE_STAFF', 'PRODUCTION_TEAM']}>
        <InventoryLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: withSuspense(<InventoryDashboard />),
      },
      {
        path: "receipt",
        element: (
          <ProtectedRoute allowedRoles={['INVENTORY_MANAGER', 'WAREHOUSE_STAFF']}>
            {withSuspense(<MaterialReceipt />)}
          </ProtectedRoute>
        ),
      },
      {
        path: "requests",
        element: withSuspense(<MaterialIssueRequests />),
      },
    ],
  },
];