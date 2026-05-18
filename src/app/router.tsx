import { createBrowserRouter } from "react-router-dom";

import NotFound from "../features/common/NotFound";
import { authRoutes } from "./routes/authRoutes";
import { inventoryRoutes } from "./routes/inventoryRoutes";
import { productionRoutes } from "./routes/productionRoutes";
import { salesRoutes } from "./routes/salesRoutes";
import { purchaseRoutes } from "./routes/purchaseRoutes";

export const router = createBrowserRouter([
  ...authRoutes,
  ...inventoryRoutes,
  ...salesRoutes,
  ...productionRoutes,
  ...purchaseRoutes,
  { path: "*", element: <NotFound /> },
]);
