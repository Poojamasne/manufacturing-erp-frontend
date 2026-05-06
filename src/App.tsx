import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { lazy, Suspense } from "react";

// Lazy imports
const SalesDashboard = lazy(() => import("./pages/sales/SalesDashboard"));
const LoginPage = lazy(() => import("./pages/LoginPage"));

// Normal imports
import ProtectedRoute from "./components/auth/ProtectedRoute";
import SalesMainLayout from "./components/modules/sales/components/MainLayout/MainLayout";
import ProductionMainLayout from "./components/modules/production/components/MainLayout/MainLayout";
import NotFound from "./components/common/NotFound";
import ReportsAndAnalytics from "./components/modules/sales/components/ReportsAndAnalytics";
import SalesEmployees from "./components/modules/sales/components/SalesEmployees";
import RoleNotMatched from "./components/common/RoleNotMatched";
import LeadsPage from "./pages/sales/LeadsPage";
import OpportunitiesPage from "./pages/sales/OpportunitiesPage";
import QuotationPage from "./pages/sales/QuotationPage";
import QuotationView from "./components/modules/sales/components/QuotationView";
import OrdersPage from "./pages/sales/OrdersPage";
import OrderView from "./components/modules/sales/components/OrderView";
import OrderCreate from "./components/modules/sales/components/OrderCreate";
import SalesProductionPage from "./pages/sales/SalesProductionPage";
import OpportunityView from "./components/modules/sales/components/OpportunityView";
import LeadForm from "./components/modules/sales/components/LeadForm";
import LeadView from "./components/modules/sales/components/LeadView";
import NotesPage from "./components/common/NotePage";
import QuotationCreate from "./components/modules/sales/components/QuotationCreate";
import ProductionEdit from "./components/modules/sales/components/ProductionEdit";
import EditLeadForm from "./components/modules/sales/components/EditLeadForm";
import AddSalesEmployee from "./components/modules/sales/components/AddSalesEmployee";
import ViewSalesEmployee from "./components/modules/sales/components/ViewSalesEmployee";
import EditSalesEmployee from "./components/modules/sales/components/EditSalesEmployee";

// Production Imports
import ProductionDashboard from './components/modules/production/Dashboard';
import ProductionPlanningScreen from './components/modules/production/components/ProductionPlanning/ProductionPlanningScreen';
import ProductionOrderList from './components/modules/production/components/ProductionOrder/ProductionOrderList';
import WorkOrderList from './components/modules/production/components/WorkOrder/WorkOrderList';
import ResourceAllocation from './components/modules/production/components/ResourceAllocation/ResourceAllocation';
import ProductionScheduler from './components/modules/production/components/Scheduling/ProductionScheduling';
import ShopFloorExecution from './components/modules/production/components/ShopFloor/ShopFloorExecution';
import ProductionReports from './components/modules/production/components/Reports/ProductionReports';

import { Toaster } from "react-hot-toast";
import SalesOrderList from "./components/modules/production/components/SalesOrder/SalesOrderList";
import EditProductionPlan from "./components/modules/production/components/ProductionPlanning/EditProductionPlan";
import CreateProductionPlan from "./components/modules/production/components/ProductionPlanning/CreateProductionPlan";
import ViewProductionPlan from "./components/modules/production/components/ProductionPlanning/ViewProductionPlan";
import PurchaseRequestList from "./components/modules/production/components/PurchaseRequest/PurchaseRequestList";
import CreateWorkOrder from "./components/modules/production/components/WorkOrder/CreateWorkOrder";

/* Global Suspense Wrapper */
const withSuspense = (Component: React.ReactNode) => (
  <Suspense
    fallback={
      <div className="h-screen w-full flex items-center justify-center">
        <div className="text-xl text-green-400">Loading...</div>
      </div>
    }
  >
    {Component}
  </Suspense>
);

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: withSuspense(<LoginPage />),
    },
    {
      path: "/role-mismatch",
      element: withSuspense(<RoleNotMatched />),

    },

    // Sales Module
    {
      path: "/sales",
      element: <ProtectedRoute requiredRole={["Sales Manager","Admin"]} />,
      children: [
        {
          element: <SalesMainLayout />,
          children: [
            {
              index: true,
              element: withSuspense(<SalesDashboard />),
            },
            {
              path: "dashboard",
              element: withSuspense(<SalesDashboard />),
            },
            {
              path: "leads",
              element: withSuspense(<LeadsPage />),
            },
            {
              path: "leads/new-lead",
              element: withSuspense(<LeadForm />),
            },
            {
              path: "leads/edit-lead/:id",
              element: withSuspense(<EditLeadForm />),
            },
            {
              path: "leads/view-lead/:id",
              element: withSuspense(<LeadView />),
            },
            {
              path: "opportunities",
              element: withSuspense(<OpportunitiesPage />),
            },
            {
              path: "opportunities/opportunity-view/:id",
              element: withSuspense(<OpportunityView />),
            },
            {
              path: "quotation",
              element: withSuspense(<QuotationPage />),
            },
            {
              path: "quotation/quotation-view/:id",
              element: withSuspense(<QuotationView />),
            },
            {
              path: "quotation/quotation-create",
              element: withSuspense(<QuotationCreate />)
            },
            {
              path: "orders",
              element: withSuspense(<OrdersPage />),
            },
            {
              path: "orders/order-view/:id",
              element: withSuspense(<OrderView />),
            },
            {
              path: "orders/create",
              element: withSuspense(<OrderCreate />),
            },
            {
              path: "production",
              element: withSuspense(<SalesProductionPage />),
            },
            {
              path: "production/production-edit/:id",
              element: withSuspense(<ProductionEdit />)
            },
            {
              path: "reports",
              element: withSuspense(<ReportsAndAnalytics />),
            },
            {
              path: "employees",
              element: withSuspense(<SalesEmployees />),
            },
            {
              path: "employees/add-employee",
              element: withSuspense(<AddSalesEmployee />),
            },
            {
              path: "employees/edit-employee/:id",
              element: withSuspense(<EditSalesEmployee />),
            },
            {
              path: "employees/view-employee/:id",
              element: withSuspense(<ViewSalesEmployee />),
            },
            {
              path: "notes",
              element: withSuspense(<NotesPage />),
            },
          ],
        },
      ],
    },

    // Production Module - Full Working Routes
    {
      path: "/production",
      element: <ProtectedRoute requiredRole={["Production Planner", "Shop Floor Operator", "Admin"]} />,
      children: [
        {
          element: <ProductionMainLayout />,
          children: [

            {
              index: true,
              element: <Navigate to="/production/dashboard" replace />
            },

            // Dashboard
            {
              path: "dashboard",
              element: withSuspense(<ProductionDashboard />)
            },

            // Production Planning
            {
              path: "sales-orders",
              element: withSuspense(<SalesOrderList />)
            },

            // Production Planning Dashboard
            {
              path: "planning",
              element: withSuspense(<ProductionPlanningScreen />)
            },

            // create production plan
            {
              path: "planning/new-plan",
              element: withSuspense(<CreateProductionPlan />)
            },

            // edit production plan
            {
              path: "planning/edit-plan/:id",
              element: withSuspense(<EditProductionPlan />)
            },

            // view production plan
            {
              path: "planning/view-plan/:id",
              element: withSuspense(<ViewProductionPlan />)
            },

            // Production Orders
            {
              path: "orders",
              element: withSuspense(<ProductionOrderList />)
            },

            // Work Orders
            {
              path: "work-orders",
              element: withSuspense(<WorkOrderList />)
            },

            // create work order
            {
              path: "work-orders/new-work-order",
              element: withSuspense(<CreateWorkOrder />)
            },

            // Resource Allocation (Machines & Operators)
            {
              path: "resources",
              element: withSuspense(<ResourceAllocation />)
            },

            // Production Scheduling
            {
              path: "scheduling",
              element: withSuspense(<ProductionScheduler />)
            },

            // Shop Floor Execution
            {
              path: "shop-floor",
              element: withSuspense(<ShopFloorExecution />)
            },
            {
              path: "work-instructions",
              element: withSuspense(<ShopFloorExecution />)
            },

            // Reports & Analytics
            {
              path: "reports",
              element: withSuspense(<ProductionReports />)
            },

            // Reports & Analytics
            {
              path: "purchase-requests",
              element: withSuspense(<PurchaseRequestList />)
            },

            // Notes
            {
              path: "notes",
              element: withSuspense(<NotesPage />)
            },
          ],
        },
      ],
    },
    {
      path: "*",
      element: <NotFound />,
    },
  ]);

  return (
    <Suspense
      fallback={
        <div className="h-screen w-full flex items-center justify-center">
          <div className="text-xl text-green-400">
            Loading App...
          </div>
        </div>
      }
    >
      <Toaster
        position="top-right"
        reverseOrder={false}
        containerStyle={{
          top: 85,
        }}
      />
      <RouterProvider router={router} />
    </Suspense>
  );
}

export default App;