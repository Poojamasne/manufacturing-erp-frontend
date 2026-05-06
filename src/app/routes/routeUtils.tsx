import { Suspense, type ReactNode } from "react";

export const withSuspense = (component: ReactNode) => (
  <Suspense
    fallback={
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-xl text-green-400">Loading...</div>
      </div>
    }
  >
    {component}
  </Suspense>
);
