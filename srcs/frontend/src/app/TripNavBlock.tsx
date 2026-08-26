import type { TripNavBlockProps } from "./type";

function TripNavDesktop({ tripId, className }: TripNavBlockProps) {
  return <div></div>;
}

function TripNavMobile({ tripId, className }: TripNavBlockProps) {
  return <div></div>;
}

export function TripNavBlock({ tripId }: TripNavBlockProps) {
  return (
    <>
      <TripNavDesktop tripId={tripId} className="hidden md:flex" />
      <TripNavMobile tripId={tripId} className="flex md:hidden" />
    </>
  );
}

export default TripNavBlock;
