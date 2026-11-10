import { useParams } from "react-router";
import { NavFrameDesktop, NavFrameMobile } from "./NavFrame";
import { AppNavDesktop, AppNavMobile } from "./AppNav";
import { TripNavDesktop, TripNavMobile } from "./TripNav";

export function Navigation() {
  const { id: tripId } = useParams();

  return (
    <>
      <NavFrameDesktop>
        <AppNavDesktop />
        {tripId && <TripNavDesktop tripId={tripId} />}
      </NavFrameDesktop>
      <NavFrameMobile>
        {tripId ? <TripNavMobile tripId={tripId} /> : <AppNavMobile />}
      </NavFrameMobile>
    </>
  );
}
export default Navigation;
