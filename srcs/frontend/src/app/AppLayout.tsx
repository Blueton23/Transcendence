import { Navigation } from "./Navigation";
import { Outlet } from "react-router";

/*
export function AppLayout() {
  return (
    <div className="flex h-screen">
      <Navigation />
      <main className="flex-1 gap-2">
        <Outlet />
      </main>
    </div>
  );
}
*/

export function AppLayout() {
  return (
    <div className="min-h-screen md:flex">
      <Navigation />

      <main className="min-w-0 flex-1 pb-20 md:pb-0">
        <Outlet />
      </main>
    </div>
  );
}