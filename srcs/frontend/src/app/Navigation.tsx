import { useParams } from "react-router";
import NavFrame from "./NavFrame";
import TripNavBlock from "./TripNavBlock";
import AppNavBlock from "./AppNavBlock";

export function Navigation() {
  const { id: tripId } = useParams();

  return (
    <NavFrame>
      {tripId ? <TripNavBlock tripId={tripId} /> : <AppNavBlock />}
    </NavFrame>
  );
}
export default Navigation;
