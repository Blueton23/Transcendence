import { Navigation } from "./navigation/Navigation";
import { Outlet } from "react-router";

export function AppLayout() {
  return (
    <div className="flex h-dvh flex-col md:flex-row">
      <Navigation />
      <main className="flex min-h-0 flex-1 flex-col gap-2">
        <Outlet />
      </main>
    </div>
  );
}
