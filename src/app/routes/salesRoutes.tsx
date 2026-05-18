import { lazy } from "react";
import type { RouteObject } from "react-router-dom";

import ProtectedRoute from "../../features/auth/ProtectedRoute";
import SalesMainLayout from "../../features/sales/layout/MainLayout";
import ReportsAndAnalytics from "../../features/sales/pages/ReportsAndAnalytics";
import SalesEmployees from "../../features/sales/pages/SalesEmployees";
import LeadsPage from "../../features/sales/pages/LeadsPage";
import OpportunitiesPage from "../../features/sales/pages/OpportunitiesPage";
import QuotationPage from "../../features/sales/pages/QuotationPage";
import QuotationView from "../../features/sales/pages/QuotationView";
import OrdersPage from "../../features/sales/pages/OrdersPage";
import OrderView from "../../features/sales/pages/OrderView";
import OrderCreate from "../../features/sales/pages/OrderCreate";
import SalesProductionPage from "../../features/sales/pages/SalesProductionPage";
import OpportunityView from "../../features/sales/pages/OpportunityView";
import LeadForm from "../../features/sales/pages/LeadForm";
import LeadView from "../../features/sales/pages/LeadView";
import NotesPage from "../../features/sales/pages/NotesPage";
import QuotationCreate from "../../features/sales/pages/QuotationCreate";
import ProductionEdit from "../../features/sales/pages/ProductionEdit";
import EditLeadForm from "../../features/sales/pages/EditLeadForm";
import AddSalesEmployee from "../../features/sales/pages/AddSalesEmployee";
import ViewSalesEmployee from "../../features/sales/pages/ViewSalesEmployee";
import EditSalesEmployee from "../../features/sales/pages/EditSalesEmployee";
import { withSuspense } from "./routeUtils";

const SalesDashboard = lazy(() => import("../../features/sales/pages/SalesDashboard"));

export const salesRoutes: RouteObject[] = [
  {
    path: "/sales",
    element: <ProtectedRoute requiredRole={["Sales Manager"]} />,
    children: [
      {
        element: <SalesMainLayout />,
        children: [
          { index: true, element: withSuspense(<SalesDashboard />) },
          { path: "dashboard", element: withSuspense(<SalesDashboard />) },
          { path: "leads", element: withSuspense(<LeadsPage />) },
          { path: "leads/new-lead", element: withSuspense(<LeadForm />) },
          { path: "leads/edit-lead/:id", element: withSuspense(<EditLeadForm />) },
          { path: "leads/view-lead/:id", element: withSuspense(<LeadView />) },
          { path: "opportunities", element: withSuspense(<OpportunitiesPage />) },
          {
            path: "opportunities/opportunity-view/:id",
            element: withSuspense(<OpportunityView />),
          },
          { path: "quotation", element: withSuspense(<QuotationPage />) },
          { path: "quotation/quotation-view/:id", element: withSuspense(<QuotationView />) },
          { path: "quotation/quotation-create", element: withSuspense(<QuotationCreate />) },
          { path: "orders", element: withSuspense(<OrdersPage />) },
          { path: "orders/order-view/:id", element: withSuspense(<OrderView />) },
          { path: "orders/create", element: withSuspense(<OrderCreate />) },
          { path: "production", element: withSuspense(<SalesProductionPage />) },
          {
            path: "production/production-edit/:id",
            element: withSuspense(<ProductionEdit />),
          },
          { path: "reports", element: withSuspense(<ReportsAndAnalytics />) },
          { path: "employees", element: withSuspense(<SalesEmployees />) },
          { path: "employees/add-employee", element: withSuspense(<AddSalesEmployee />) },
          {
            path: "employees/edit-employee/:id",
            element: withSuspense(<EditSalesEmployee />),
          },
          {
            path: "employees/view-employee/:id",
            element: withSuspense(<ViewSalesEmployee />),
          },
          { path: "notes", element: withSuspense(<NotesPage />) },
        ],
      },
    ],
  },
];
