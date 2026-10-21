import NavPill, { NavPillMobile } from "./NavPill";
import IconBadge from "../../shared/ui/IconBadge";
import Text from "../../shared/ui/Text";
import Icon from "../../shared/ui/Icon";
import Divider from "../../shared/ui/Divider";
import { Link } from "react-router";
import type { IconName } from "../../shared/ui/Icon";
import { useTranslation } from "react-i18next";

interface TripNavProps {
  tripId: string;
}

interface TripNavItem {
  to: string;
  iconName: IconName;
  label: string;
  badgeCount?: number;
}

// badgeCount => valeurs de test pour l'instant.
// - "ideas" : nombre d'idées à placer (Idea sans step) calculable à partir des idées
// - "chat"  : messages NON LUS --> nécessite un LastMessageReadAt par participation côté backend.
// TODO(backend): brancher ces compteurs sur les vraies données.
function getTripNavItems(tripId: string): TripNavItem[] {
  return [
    {
      to: `/trip/${tripId}/itinerary`,
      iconName: "route",
      label: "nav.itinerary",
    },
    {
      to: `/trip/${tripId}/ideas`,
      iconName: "pinplus",
      label: "nav.ideas",
      badgeCount: 2,
    },
    {
      to: `/trip/${tripId}/expenses`,
      iconName: "wallet",
      label: "nav.expenses",
    },
    {
      to: `/trip/${tripId}/chat`,
      iconName: "chat",
      label: "nav.chat",
      badgeCount: 3,
    },
    {
      to: `/trip/${tripId}/assistant`,
      iconName: "spark",
      label: "nav.assistant",
    },
  ];
}

export function TripNavDesktop({ tripId }: TripNavProps) {
  const items = getTripNavItems(tripId);
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-8">
      <Link
        to="/trip"
        className="font-md flex items-center gap-2 text-xs text-text-secondary"
      >
        <Icon name="back" size={16} />
        {t("nav.trips")}
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
        {items.map((item) => (
          <NavPill key={item.to} {...item} label={t(item.label)} />
        ))}
      </div>
    </div>
  );
}

export function TripNavMobile({ tripId }: TripNavProps) {
  const items = getTripNavItems(tripId);
  return (
    <div className="flex gap-1">
      {items.map((item) => (
        <NavPillMobile
          key={item.to}
          to={item.to}
          iconName={item.iconName}
          badgeCount={item.badgeCount}
        />
      ))}
    </div>
  );
}
