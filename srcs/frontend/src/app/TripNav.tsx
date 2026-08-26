import NavPill, { NavPillMobile } from "./NavPill";
import IconBadge from "../shared/ui/IconBadge";
import Text from "../shared/ui/Text";
import Icon from "../shared/ui/Icon";
import Divider from "../shared/ui/Divider";
import { Link } from "react-router";


interface TripNavProps {
  tripId: string;
}

export function TripNavDesktop({ tripId }: TripNavProps) {
  return (
    <div className="flex flex-col gap-8">
      <Link
        to="/trip"
        className="font-md flex items-center gap-2 text-xs text-text-secondary"
      >
        <Icon name="back" size={16} />
        Mes voyages
      </Link>
      <div className="flex items-center gap-4">
        <IconBadge color="brand" name="mtn" />
        <Text size="md" className="font-bold">
          Road trip Suisse
        </Text>
      </div>
      <div>TODO: identite du voyages (nom, dates, avatars)</div>
      <Divider />
      <div className="flex flex-col gap-1">
        <NavPill
          to={`/trip/${tripId}/itinerary`}
          iconName="route"
          label="Itinéraire"
        ></NavPill>
        <NavPill
          to={`/trip/${tripId}/ideas`}
          iconName="pinplus"
          label="Idées"
          badgeCount={2}
        ></NavPill>
        <NavPill
          to={`/trip/${tripId}/expenses`}
          iconName="wallet"
          label="Dépenses"
        ></NavPill>
        <NavPill
          to={`/trip/${tripId}/chat`}
          iconName="chat"
          label="Discussion"
          badgeCount={3}
        ></NavPill>
        <NavPill
          to={`/trip/${tripId}/assistant`}
          iconName="spark"
          label="Assistant IA"
        ></NavPill>
      </div>
    </div>
  );
}

export function TripNavMobile({ tripId }: TripNavProps) {
  return (
    <div className="flex gap-1">
      <NavPillMobile
        to={`/trip/${tripId}/itinerary`}
        iconName="route"
      ></NavPillMobile>
      <NavPillMobile
        to={`/trip/${tripId}/ideas`}
        iconName="pinplus"
        badgeCount={2}
      ></NavPillMobile>
      <NavPillMobile
        to={`/trip/${tripId}/expenses`}
        iconName="wallet"
      ></NavPillMobile>
      <NavPillMobile
        to={`/trip/${tripId}/chat`}
        iconName="chat"
        badgeCount={3}
      ></NavPillMobile>
      <NavPillMobile
        to={`/trip/${tripId}/assistant`}
        iconName="spark"
      ></NavPillMobile>
    </div>
  );
}
