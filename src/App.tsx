import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { lazy, Suspense } from "react";

// Lazy imports
const SalesDashboard = lazy(() => import("./pages/sales/SalesDashboard"));
const LoginPage = lazy(() => import("./pages/LoginPage"));

// Normal imports
import ProtectedRoute from "./components/auth/ProtectedRoute";
import MainLayout from "./components/modules/sales/components/MainLayout/MainLayout";
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
import { Toaster } from "react-hot-toast";

let currentPath = window.location.pathname;

const checkPath = (path: string) => {
  if (currentPath === "/") {
    return 30;
  }
  else {
    return 85;
  }
}
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

    // Login Route
    {
      path: "/",
      element: withSuspense(<LoginPage />),
    },

    // Role mismatch
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
          element: <MainLayout />,
          children: [

            // Default route → /sales
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
              path: "leads/view-lead/:id",
              element: <LeadView />,
            },
            {
              path: "notes",
              element: <NotesPage />,
            },
          ],
        },
      ],
    },

    // Fallback Route
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