import { Footer } from "@/app/Footer";
import { TravelSocketProvider } from "@/features/travel/realtime/TravelSocketProvider";
import { Navigation } from "./navigation/Navigation";
import { Outlet, useParams } from "react-router";

export function AppLayout() {
  const { id } = useParams();

  const layout = (
    <div className="flex h-dvh flex-col md:flex-row">
      <Navigation />
      <main className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pb-24 md:pb-0">
        <Outlet />
        <div className="md:hidden">
          <Footer />
        </div>
      </main>
    </div>
  );

  if (!id) return layout;

  // One socket per trip, shared by the trip nav (unread badge) and the pages.
  const travelId = Number(id);
  return (
    <TravelSocketProvider key={travelId} travelId={travelId}>
      {layout}
    </TravelSocketProvider>
  );
}
