import { Suspense } from "react";
import { RouterProvider } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { router } from "./router";

export default function App() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-full flex items-center justify-center">
          <div className="text-xl text-green-400">Loading App...</div>
        </div>
      }
    >
      <Toaster position="top-right" reverseOrder={false} containerStyle={{ top: 85 }} />
      <RouterProvider router={router} />
    </Suspense>
  );
}
