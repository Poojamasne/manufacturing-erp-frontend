import type { RouteObject } from "react-router-dom";
import { lazy } from "react";

import ProtectedRoute from "../../features/auth/ProtectedRoute";
import InventoryLayout from "../../features/inventory/layout/InventoryLayout";
import { withSuspense } from "./routeUtils";
import MaterialReceiptList from "../../features/inventory/components/MaterialReceipt/MaterialReceiptList";
import NewMaterialReceipt from "../../features/inventory/components/MaterialReceipt/NewMaterialReceipt";
import WarehouseManagement from "../../features/inventory/pages/wareHouseManagment";
import MaterialIssueExecution from "../../features/inventory/pages/MaterialIssueExecution";
import ViewMaterialReceiptEntry from "../../features/inventory/components/MaterialReceipt/ViewMaterialReceiptEntry";
import EditReceiptEntry from "../../features/inventory/components/MaterialReceipt/EditMaterialReceipt";

const InventoryDashboard = lazy(
  () => import("../../features/inventory/pages/InventoryDashboard")
);

export const inventoryRoutes: RouteObject[] = [
  {
    path: "/inventory",
    element: <ProtectedRoute requiredRole={["Inventory Manager", "Admin"]} />,
    children: [
      {
        element: <InventoryLayout />,
        children: [
          { index: true, element: <InventoryDashboard /> },
          { path: "dashboard", element: withSuspense(<InventoryDashboard />) },
          { path: "material-receipts", element: withSuspense(<MaterialReceiptList />) },
          { path: "material-receipts/new-material-receipt", element: withSuspense(<NewMaterialReceipt />) },
          { path: "wareHouse", element: withSuspense(<WarehouseManagement />) },
          {path: "issue-execution",element: withSuspense(<MaterialIssueExecution/>)},
          { path: "material-receipts/view/:id", element: withSuspense(<ViewMaterialReceiptEntry />) },
          { path: "material-receipts/edit/:id", element: withSuspense(<EditReceiptEntry />) },
        ],
      },
    ],
  },
];
