import { useEffect, useState } from "react";
import NavPill, { NavPillMobile } from "./NavPill";
import IconBadge from "../../shared/ui/IconBadge";
import Text from "../../shared/ui/Text";
import Divider from "../../shared/ui/Divider";
import type { IconName } from "../../shared/ui/Icon";
import { getUnreadCount } from "@/features/chat/api/chatApi";

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
    { to: `/trip/${tripId}/itinerary`, iconName: "route", label: "Itinéraire" },
    {
      to: `/trip/${tripId}/ideas`,
      iconName: "pinplus",
      label: "Idées",
      badgeCount: 2,
    },
    { to: `/trip/${tripId}/expenses`, iconName: "wallet", label: "Dépenses" },
    {
      to: `/trip/${tripId}/chat`,
      iconName: "chat",
      label: "Discussion",
      badgeCount: unreadCount,
    },
    {
      to: `/trip/${tripId}/assistant`,
      iconName: "spark",
      label: "Assistant IA",
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
          <NavPill key={item.to} {...item} />
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
