import Divider from "@/shared/ui/Divider";
import Text from "@/shared/ui/Text";
import type { Segment } from "@/features/step/api/segmentApi";
import {
  computeDurationLabel,
  computeTotalHours,
  computeTotalKms,
} from "@/features/step/segmentDuration";

export function TotalSegment({ segments }: { segments: Segment[] }) {
  const totalHours = computeTotalHours(segments);
  const totalKms = computeTotalKms(segments);
  const totalHoursLabel = computeDurationLabel(totalHours);

  return (
    <div className="col-span-2 flex flex-col items-center gap-2">
      <Divider></Divider>
      <Text font="mono" tone="muted" className="text-[10px] md:text-sm">
        TOTAL · {totalHoursLabel} DE ROUTE · {totalKms} KM
      </Text>
    </div>
  );
}
