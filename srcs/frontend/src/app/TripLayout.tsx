import { Outlet, useParams } from "react-router";

import { TravelSocketProvider } from "@/features/travel/realtime/TravelSocketProvider";

export function TripLayout() {
  const { id } = useParams();
  const travelId = Number(id);

  return (
    <TravelSocketProvider key={travelId} travelId={travelId}>
      <Outlet />
    </TravelSocketProvider>
  );
}
