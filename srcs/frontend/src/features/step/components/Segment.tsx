import type { Segment } from "../api/segmentApi";
import Text from "../../../shared/ui/Text";
import Icon from "../../../shared/ui/Icon";
import { computeDurationLabel } from "../segmentDuration";

function DashedDivider() {
  return (
    <div className="flex flex-1 items-center">
      <div className="ml-1 h-0.5 flex-1 bg-dashed-line" />
    </div>
  );
}

function SegmentRow({ segment }: { segment: Segment }) {
  const durationHours = computeDurationLabel(segment.durationMinutes);
  return (
    <div className="flex gap-3">
      <Icon name="car" size={16} className="text-brand-primary" />
      <Text font="mono" tone="muted" className="text-[10px] md:text-sm">
        {durationHours} · {segment.distanceKm} KM
      </Text>
      <DashedDivider />
    </div>
  );
}
export default SegmentRow;
