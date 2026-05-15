import type { RouteObject } from "react-router-dom";
import { lazy } from "react";

import ProtectedRoute from "../../features/auth/ProtectedRoute";
import InventoryLayout from "../../features/purchase_management/layout/PurchaseManagerLayout";
import { withSuspense } from "./routeUtils";
import CreatePurchaseRequest from "../../features/purchase_management/components/Purchase_Request_Management/CreatePurchaseRequest";
import PurchaseRequestList from "../../features/purchase_management/components/Purchase_Request_Management/PurchaseRequestList";
import EditPurchaseRequest from "../../features/purchase_management/components/Purchase_Request_Management/EditPurchaseRequest";
import ViewPurchaseRequest from "../../features/purchase_management/components/Purchase_Request_Management/ViewPurchaseRequest";

const PurchaseDashboard = lazy(
  () => import("../../features/purchase_management/components/Dashboard/Dashboard")
);
const PurchaseNotes = lazy(
  () => import("../../features/purchase_management/pages/NotesPage")
);

export const purchaseRoutes: RouteObject[] = [
  {
    path: "/purchase",
    element: <ProtectedRoute requiredRole={["Purchase Manager", "purchase_manager", "Admin"]} />,
    children: [
      {
        element: <InventoryLayout />,
        children: [
          { index: true, element: withSuspense(<PurchaseDashboard />) },
          { path: "dashboard", element: withSuspense(<PurchaseDashboard />) },
          { path: "purchase-requests", element: withSuspense(<PurchaseRequestList />) },
          { path: "purchase-requests/create-purchase-request", element: withSuspense(<CreatePurchaseRequest />) },
          { path: "purchase-requests/edit-purchase-request/:id", element: withSuspense(<EditPurchaseRequest />) },
          { path: "purchase-requests/view-purchase-request/:id", element: withSuspense(<ViewPurchaseRequest />) },
          { path: "notes", element: withSuspense(<PurchaseNotes />) },
        ],
      },
    ],
  },
];