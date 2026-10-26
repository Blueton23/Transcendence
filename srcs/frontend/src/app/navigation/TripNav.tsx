import { useEffect, useState } from "react";
import NavPill, { NavPillMobile } from "./NavPill";
import IconBadge from "../../shared/ui/IconBadge";
import Text from "../../shared/ui/Text";
import Divider from "../../shared/ui/Divider";
import type { IconName } from "../../shared/ui/Icon";
import { getUnreadCount } from "@/features/chat/api/chatApi";
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
function getTripNavItems(tripId: string, unreadCount: number): TripNavItem[] {
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
      badgeCount: 2,
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
    {
      to: `/travel/${tripId}/assistant`,
      iconName: "spark",
      label: "nav.assistant",
    },
  ];
}

//SDU : possible de faire un fonction generique par la suite?
function useUnreadCount(tripId: string): number {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    async function fetchUnreadCount() {
      try {
        const result = await getUnreadCount(Number(tripId));
        setUnreadCount(result.unreadCount);
      } catch (error) {
        console.error(
          "Impossible de récupérer le nombre de messages non lus :",
          error,
        );
      }
    }

    fetchUnreadCount();
  }, [tripId]);

  return unreadCount;
}

export function TripNavDesktop({ tripId }: TripNavProps) {
  const unreadCount = useUnreadCount(tripId);
  const items = getTripNavItems(tripId, unreadCount);
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-8">
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
  const unreadCount = useUnreadCount(tripId);
  const items = getTripNavItems(tripId, unreadCount);

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
