import { TravelersStack } from "@/features/travel/components/TravelersStack";
import { TravelTitle } from "@/features/travel/components/TravelTitle";
import { useTravel } from "@/features/travel/hooks/useTravel";
import { getStatus } from "@/features/travel/utils/getStatus";
import { getTravelBandColor } from "@/features/travel/utils/getTravelBandColor";
import Card from "@/shared/ui/Card";
import Tag from "@/shared/ui/Tag";

export function TravelIdentity({ travelId }: { travelId: string }) {
  const { travel } = useTravel(Number(travelId));

  if (!travel) return null;

  return (
    <Card
      band={
        <Tag tone="light" className="font-semibold">
          {getStatus(travel)}
        </Tag>
      }
      bandClassName={getTravelBandColor(travel.id)}
      className="flex flex-col gap-2 p-3"
    >
      <TravelTitle travel={travel} />
      <TravelersStack travel={travel} />
    </Card>
  );
}
