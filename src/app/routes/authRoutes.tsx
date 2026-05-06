import { lazy } from "react";
import type { RouteObject } from "react-router-dom";

import RoleNotMatched from "../../features/common/RoleNotMatched";
import { withSuspense } from "./routeUtils";

const LoginPage = lazy(() => import("../../features/auth/pages/LoginPage"));

export const authRoutes: RouteObject[] = [
  { path: "/", element: withSuspense(<LoginPage />) },
  { path: "/role-mismatch", element: withSuspense(<RoleNotMatched />) },
];
