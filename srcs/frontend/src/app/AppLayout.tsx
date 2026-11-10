import { Footer } from "@/app/Footer";
import { NotificationSocketProvider } from "@/features/notifications/realtime/NotificationSocketProvider";
import { TravelAccessGuard } from "@/features/travel/realtime/TravelAccessGuard";
import { TravelSocketProvider } from "@/features/travel/realtime/TravelSocketProvider";
import { Navigation } from "./navigation/Navigation";
import { Outlet, useParams } from "react-router";
import { OfflineBanner } from "@/app/OfflineBanner";
import { ErrorBanner } from "@/app/ErrorBanner";

export function AppLayout() {
  const { id } = useParams();

  const layout = (
    <div className="flex h-dvh flex-col md:flex-row">
      <Navigation />
      <main className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pb-24 md:pb-0">
        <OfflineBanner />
        <ErrorBanner />
        <Outlet />
        <div className="md:hidden">
          <Footer />
        </div>
      </main>
    </div>
  );

  // One socket per trip, shared by the trip nav (unread badge) and the pages.
  const travelId = Number(id);
  const content = id ? (
    <TravelSocketProvider key={travelId} travelId={travelId}>
      <TravelAccessGuard />
      {layout}
    </TravelSocketProvider>
  ) : (
    layout
  );

  // The personal socket stays open across pages, trip or not.
  return <NotificationSocketProvider>{content}</NotificationSocketProvider>;
}
