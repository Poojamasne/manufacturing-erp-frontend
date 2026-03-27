import {
  createBrowserRouter,
  RouterProvider,
  // Outlet
} from "react-router-dom";
import { SalesDashboard } from "./pages/sales/SalesDashboard";
import { LoginPage } from "./pages/LoginPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import MainLayout from "./components/modules/sales/components/MainLayout/MainLayout";
import NotFound from "./components/common/NotFound";

// const Layout = () => {
//   return (
//     <>
//       {/* Common UI like Navbar, Sidebar */}
//       <Outlet />
//     </>
//   );
// };

function App() {
  const router = createBrowserRouter([
    {
      path: "/login",
      element: <LoginPage />,
    },
    // Sales Module Routes
    {
      path: "/sales",
      element: <ProtectedRoute requiredRole="sales_manager" />,
      children: [
        {
          element: <MainLayout />,
          children: [
            {
              index: true, // default route → /sales
              element: <SalesDashboard />,
            },
            {
              path: "home",
              element: <SalesDashboard />,
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

  return <RouterProvider router={router} />;
}

export default App;