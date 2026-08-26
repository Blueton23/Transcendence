import NavPill from "./NavPill";
import IconBadge from "../shared/ui/IconBadge";
import Text from "../shared/ui/Text";
import Icon from "../shared/ui/Icon";
import Divider from "../shared/ui/Divider";
import { Link } from "react-router";


// Navigation.tsx — placeholder temporaire, pas de logique, juste des valeurs
const trip = {
  name: "Road trip Suisse",
  dateRange: "12–16 JUIL · 5 J",
  travelers: [
    { initials: "CH", colorClass: "bg-brand-dark" },
    { initials: "DA", colorClass: "bg-brand-primary-strong" },
    { initials: "SO", colorClass: "bg-warning" },
  ],
};

interface TripNavProps {
  tripId: string;
}

export function TripNavDesktop({ tripId }: TripNavProps) {
  return (
    <div className="flex flex-col gap-8">
      <Link to="/trip"className="flex items-center gap-2 text-xs font-md text-text-secondary">
      <Icon name="back"size={16} />
      Mes voyages</Link>
    <div className="flex items-center gap-4">
      <IconBadge color="brand" name="mtn" />
      <Text size="md" className="font-bold">Road trip Suisse</Text>
    </div>
    <div>TODO: identite du voyages (nom, dates, avatars)</div>
    <Divider/>
    <div className="flex flex-col gap-1">
    <NavPill to={`/trip/${tripId}/itinerary`} icon={<Icon name="route"/>} label="Itinéraire"></NavPill>
    <NavPill to={`/trip/${tripId}/ideas`} icon={<Icon name="pinplus"/>} label="Idées" badgeCount={2}></NavPill>
    <NavPill to={`/trip/${tripId}/expenses`} icon={<Icon name="wallet"/>} label="Dépenses"></NavPill>
    <NavPill to={`/trip/${tripId}/chat`} icon={<Icon name="chat"/>} label="Discussion" badgeCount={3}></NavPill>
    <NavPill to={`/trip/${tripId}/assistant`} icon={<Icon name="spark"/>} label="Assistant IA"></NavPill>
    </div>
  </div>
  );
}

export function TripNavMobile({ tripId }: TripNavProps) {
  return <div></div>;
}
