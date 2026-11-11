import type { Travel } from "@/features/travel/types";
import Avatar from "@/shared/ui/Avatar";
import { getAvatarColor } from "@/shared/utils/getAvatarColors";

export function TravelersStack({ travel }: { travel: Travel }) {
  const visible = travel.travelers.slice(0, 3);
  const hidden = travel.travelers.length - visible.length;

  return (
    <div className="flex -space-x-2">
      {visible.map((traveler) => (
        <Avatar
          key={traveler.id}
          size="sm"
          className="ring-2 ring-surface"
          color={getAvatarColor(travel.travelers, traveler.id)}
        >
          {traveler.initials}
        </Avatar>
      ))}
      {hidden > 0 && (
        <Avatar size="sm" color="pending" className="ring-2 ring-surface">
          +{hidden}
        </Avatar>
      )}
    </div>
  );
}
