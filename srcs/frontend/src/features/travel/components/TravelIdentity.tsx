import { TravelTitle } from "@/features/travel/components/TravelTitle";
import { useTravel } from "@/features/travel/hooks/useTravel";
import { getStatus } from "@/features/travel/utils/getStatus";
import Avatar from "@/shared/ui/Avatar";
import Card from "@/shared/ui/Card";
import Text from "@/shared/ui/Text";
import { getAvatarColor } from "@/shared/utils/getAvatarColors";

export function TravelIdentity({ travelId }: { travelId: string }) {
  const { travel } = useTravel(Number(travelId));

  if (!travel) return null;

  const visible = travel.travelers.slice(0, 3);
  const hidden = travel.travelers.length - visible.length;

  return (
    <Card className="overflow-hidden p-0!">
      <div className="bg-error-bg px-3 py-1.5">
        <Text size="sm" className="font-semibold">
          {getStatus(travel)}
        </Text>
      </div>
      <div className="flex flex-col gap-1 p-3">
        <TravelTitle travel={travel} />
        <div className="mt-1 flex -space-x-2">
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
            <Avatar size="sm" className="ring-2 ring-surface">
              +{hidden}
            </Avatar>
          )}
        </div>
      </div>
    </Card>
  );
}
