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
import OpportunityEdit from "./components/modules/sales/components/OpportunityEdit";
import QuotationCreate from "./components/modules/sales/components/QuotationCreate";
import ProductionEdit from "./components/modules/sales/components/ProductionEdit";
import EditLeadForm from "./components/modules/sales/components/EditLeadForm";
import AddSalesEmployee from "./components/modules/sales/components/AddSalesEmployee";
import ViewSalesEmployee from "./components/modules/sales/components/ViewSalesEmployee";
import EditSalesEmployee from "./components/modules/sales/components/EditSalesEmployee";

// Production Imports
import ProductionProtectedRoute from "./components/auth/ProductionProtectedRoute";
import ProductionDashboard from './components/modules/production/Dashboard';
import ProductionPlanningScreen from './components/modules/production/components/ProductionPlanning/ProductionPlanningScreen';
import ProductionOrderList from './components/modules/production/components/ProductionOrder/ProductionOrderList';
import WorkOrderList from './components/modules/production/components/ProductionOrder/WorkOrderList';
import ResourceAllocation from './components/modules/production/components/ResourceAllocation/ResourceAllocation';
import ProductionScheduler from './components/modules/production/components/Scheduling/ProductionScheduling';
import ShopFloorExecution from './components/modules/production/components/ShopFloor/ShopFloorExecution';
import ProductionReports from './components/modules/production/components/Reports/ProductionReports';

import { Toaster } from "react-hot-toast";
import MachineDetailView from "./components/modules/production/components/ResourceAllocation/MachineDetailView";
import ProductionScheduling from "./components/modules/production/components/Scheduling/ProductionScheduling";

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
      element: <RoleNotMatched />,

    },

    // Sales Module
    {
      path: "/sales",
      element: <ProtectedRoute requiredRole="Sales Manager" />,
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
              element: <LeadsPage />,
            },
            {
              path: "leads/new-lead",
              element: <LeadForm />,
            },
            {
              path: "leads/edit-lead/:id",
              element: <EditLeadForm />,
            },
            {
              path: "leads/view-lead/:id",
              element: <LeadView />,
            },
            {
              path: "opportunities",
              element: <OpportunitiesPage />,
            },
            {
              path: "opportunities/opportunity-view/:id",
              element: <OpportunityView />,
            },
            {
              path: "opportunities/opportunity-edit/:id",
              element: <OpportunityEdit />
            },
            {
              path: "quotation",
              element: <QuotationPage />,
            },
            {
              path: "quotation/quotation-view/:id",
              element: <QuotationView />,
            },
            {
              path: "quotation/quotation-create",
              element: <QuotationCreate />
            },
            {
              path: "orders",
              element: <OrdersPage />,
            },
            {
              path: "orders/order-view/:id",
              element: <OrderView />,
            },
            {
              path: "orders/create",
              element: <OrderCreate />,
            },
            {
              path: "production",
              element: <SalesProductionPage />,
            },
            {
              path: "production/production-edit/:id",
              element: <ProductionEdit />
            },
            {
              path: "reports",
              element: <ReportsAndAnalytics />,
            },
            {
              path: "employees",
              element: <SalesEmployees />,
            },
            {
              path: "employees/add-employee",
              element: <AddSalesEmployee />,
            },
            {
              path: "employees/edit-employee/:id",
              element: <EditSalesEmployee />,
            },
            {
              path: "employees/view-employee/:id",
              element: <ViewSalesEmployee />,
            },
            {
              path: "notes",
              element: <NotesPage />,
            },
          ],
        },
      ],
    },

    // Production Module - Full Working Routes
    {
      path: "/production",
      element: <ProductionProtectedRoute requiredRoles={["Production Planner", "Shop Floor Operator"]} />,
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
              element: <ProductionDashboard />
            },

            // Production Planning
            {
              path: "planning",
              element: <ProductionPlanningScreen />
            },

            // Production Orders
            {
              path: "orders",
              element: <ProductionOrderList />
            },
            {
              path: "orders/view/:id",
              element: <ProductionOrderList />
            },
            {
              path: "orders/edit/:id",
              element: <ProductionOrderList />
            },

            // Work Orders
            {
              path: "work-orders",
              element: <WorkOrderList />
            },
            {
              path: "work-orders/view/:id",
              element: <WorkOrderList />
            },
            {
              path: "work-orders/assign",
              element: <WorkOrderList />
            },

            // Resource Allocation (Machines & Operators)
            {
              path: "resources",
              element: <ResourceAllocation />
            },
            {
              path: "resources/machines/:id",
              element: <MachineDetailView />
            },
            {
              path: "scheduling",
              element: <ProductionScheduling />
            },

            // Production Scheduling
            {
              path: "scheduling",
              element: <ProductionScheduler />
            },
            {
              path: "calendar",
              element: <ProductionScheduler />
            },
            {
              path: "shifts",
              element: <ProductionScheduler />
            },

            // Shop Floor Execution
            {
              path: "shop-floor",
              element: <ShopFloorExecution />
            },
            {
              path: "production-tracking",
              element: <ShopFloorExecution />
            },
            {
              path: "work-instructions",
              element: <ShopFloorExecution />
            },

            // Reports & Analytics
            {
              path: "reports",
              element: <ProductionReports />
            },
            {
              path: "analytics",
              element: <ProductionReports />
            },

            // Notes
            {
              path: "notes",
              element: <NotesPage />
            },

            // Sales Orders (Integration with sales module)
            {
              path: "sales-orders",
              element: <ProductionPlanningScreen />
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