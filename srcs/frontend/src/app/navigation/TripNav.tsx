import NavPill from "./NavPill";
import Divider from "../../shared/ui/Divider";
import type { IconName } from "../../shared/ui/Icon";
import { useUnreadCount } from "@/features/chat/hooks/useUnreadCount";
import { useUnseenIdeasCount } from "@/features/idea/hooks/useUnseenIdeasCount";
import { useTranslation } from "react-i18next";
import { TravelIdentity } from "@/app/navigation/TravelIdentity";

interface TripNavProps {
  tripId: string;
}

interface TripNavItem {
  to: string;
  iconName: IconName;
  label: string;
  badgeCount?: number;
}

// badgeCount :
// - "ideas" : nouvelles idées des autres depuis le dernier passage sur la page
// - "chat"  : messages non lus
function getTripNavItems(
  tripId: string,
  unreadCount: number,
  unseenIdeasCount: number,
): TripNavItem[] {
  return [
    {
      to: `/travel/${tripId}/itinerary`,
      iconName: "route",
      label: "nav.itinerary",
    },
    {
      to: `/travel/${tripId}/ideas`,
      iconName: "pinplus",
      label: "nav.ideas",
      badgeCount: unseenIdeasCount,
    },
    {
      to: `/travel/${tripId}/expenses`,
      iconName: "wallet",
      label: "nav.expenses",
    },
    {
      to: `/travel/${tripId}/chat`,
      iconName: "chat",
      label: "nav.chat",
      badgeCount: unreadCount,
    },
  ];
}

export function TripNavDesktop({ tripId }: TripNavProps) {
  const unreadCount = useUnreadCount(Number(tripId));
  const unseenIdeasCount = useUnseenIdeasCount(Number(tripId));
  const items = getTripNavItems(tripId, unreadCount, unseenIdeasCount);
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-4">
      <Divider />
      <TravelIdentity travelId={tripId} />
      <nav
        aria-label={t("nav.trip")}
        className="ml-2.5 flex flex-col gap-1 border-l border-border-control pl-2.5"
      >
        {items.map((item) => (
          <NavPill key={item.to} {...item} label={t(item.label)} />
        ))}
      </nav>
    </div>
  );
}

export function TripNavMobile({ tripId }: TripNavProps) {
  const { t } = useTranslation();
  const unreadCount = useUnreadCount(Number(tripId));
  const unseenIdeasCount = useUnseenIdeasCount(Number(tripId));
  const items = getTripNavItems(tripId, unreadCount, unseenIdeasCount);

  return (
    <div className="flex w-full gap-1">
      {items.map((item) => (
        <NavPill
          key={item.to}
          to={item.to}
          iconName={item.iconName}
          badgeCount={item.badgeCount}
          label={t(item.label)}
          variant="mobile"
        />
      ))}
    </div>
  );
}
