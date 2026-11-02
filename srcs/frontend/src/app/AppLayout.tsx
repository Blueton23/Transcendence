import { Footer } from "@/app/Footer";
import { Navigation } from "./navigation/Navigation";
import { Outlet } from "react-router";
import { OfflineBanner } from "@/app/OfflineBanner";

export function AppLayout() {
  return (
    <div className="flex h-dvh flex-col md:flex-row">
      <Navigation />
      <main className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pb-24 md:pb-0">
        <OfflineBanner />
        <Outlet />
        <div className="md:hidden">
          <Footer />
        </div>
      </main>
    </div>
  );
}
