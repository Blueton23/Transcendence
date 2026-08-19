import { Navigation } from "./Navigation";
import { Outlet } from "react-router";

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
