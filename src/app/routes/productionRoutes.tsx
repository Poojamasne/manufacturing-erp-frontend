import { lazy } from "react";
import type { RouteObject } from "react-router-dom";
import { Navigate } from "react-router-dom";

import ProductionProtectedRoute from "../../features/auth/ProductionProtectedRoute";
import ProductionMainLayout from "../../features/production/layout/MainLayout";
import ProductionPlanningScreen from "../../features/production/pages/ProductionPlanningScreen";
import ProductionOrderList from "../../features/production/pages/ProductionOrderList";
import WorkOrderList from "../../features/production/pages/WorkOrderList";
import ResourceAllocation from "../../features/production/pages/ResourceAllocation";
import ProductionScheduler from "../../features/production/pages/ProductionScheduling";
import ShopFloorExecution from "../../features/production/pages/ShopFloorExecution";
import ProductionReports from "../../features/production/pages/ProductionReports";
import SalesOrderList from "../../features/production/pages/SalesOrderList";
import EditProductionPlan from "../../features/production/pages/EditProductionPlan";
import CreateProductionPlan from "../../features/production/pages/CreateProductionPlan";
import ViewProductionPlan from "../../features/production/pages/ViewProductionPlan";
import PurchaseRequestList from "../../features/production/pages/PurchaseRequestList";
import CreateWorkOrder from "../../features/production/pages/CreateWorkOrder";
import NotesPage from "../../features/sales/pages/NotesPage";
import { withSuspense } from "./routeUtils";

const ProductionDashboard = lazy(
  () => import("../../features/production/pages/ProductionDashboard")
);

export const productionRoutes: RouteObject[] = [
  {
    path: "/production",
    element: (
      <ProductionProtectedRoute
        requiredRoles={["Production Planner", "Shop Floor Operator"]}
      />
    ),
    children: [
      {
        element: <ProductionMainLayout />,
        children: [
          { index: true, element: <Navigate to="/production/dashboard" replace /> },
          { path: "dashboard", element: withSuspense(<ProductionDashboard />) },
          { path: "sales-orders", element: withSuspense(<SalesOrderList />) },
          { path: "planning", element: withSuspense(<ProductionPlanningScreen />) },
          { path: "planning/new-plan", element: withSuspense(<CreateProductionPlan />) },
          { path: "planning/edit-plan/:id", element: withSuspense(<EditProductionPlan />) },
          { path: "planning/view-plan/:id", element: withSuspense(<ViewProductionPlan />) },
          { path: "orders", element: withSuspense(<ProductionOrderList />) },
          { path: "work-orders", element: withSuspense(<WorkOrderList />) },
          { path: "work-orders/new-work-order", element: withSuspense(<CreateWorkOrder />) },
          { path: "resources", element: withSuspense(<ResourceAllocation />) },
          { path: "scheduling", element: withSuspense(<ProductionScheduler />) },
          { path: "shop-floor", element: withSuspense(<ShopFloorExecution />) },
          { path: "work-instructions", element: withSuspense(<ShopFloorExecution />) },
          { path: "reports", element: withSuspense(<ProductionReports />) },
          { path: "purchase-requests", element: withSuspense(<PurchaseRequestList />) },
          { path: "notes", element: withSuspense(<NotesPage />) },
        ],
      },
    ],
  },
];
