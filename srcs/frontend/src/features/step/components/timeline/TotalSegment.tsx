import Divider from "@/shared/ui/Divider";
import Text from "@/shared/ui/Text";
import { computeDurationLabel } from "@/features/step/utils/segmentDuration";
import type { Route } from "@/features/map/types";

interface TotalSegmentProps {
  route: Route | null;
}

export function TotalSegment({ route }: TotalSegmentProps) {
  if (!route) return null;
  const totalMinutes = route.totalDurationMinutes;
  const totalKms = route.totalDistanceKm;
  const totalHoursLabel = computeDurationLabel(totalMinutes);

  return (
    <div className="col-span-2 flex flex-col items-center gap-2">
      <Divider></Divider>
      <Text font="mono" tone="muted" className="text-[10px] md:text-sm">
        TOTAL · {totalHoursLabel} DE ROUTE · {totalKms} KM
      </Text>
    </div>
  );
}
