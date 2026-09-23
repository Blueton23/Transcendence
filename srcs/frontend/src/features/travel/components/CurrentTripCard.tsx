import type { Segment } from "@/features/step/api/segmentApi";
import { computeTotalKms } from "@/features/step/utils/segmentDuration";
import type { Travel } from "@/features/travel/types";
import { computeTravelDates } from "@/features/travel/utils/computeTravelDates";
import Button from "@/shared/ui/Button";
import Heading from "@/shared/ui/Heading";
import Icon from "@/shared/ui/Icon";
import Tag from "@/shared/ui/Tag";

interface CurrentTripCardProps {
  travel: Travel;
  segments: Segment[];
}

export function CurrentTripCard({ travel, segments }: CurrentTripCardProps) {
  const dateLabels = computeTravelDates(travel.startDate, travel.endDate);
  const totalKms = computeTotalKms(segments);
  return (
    <>
      <div className="relative flex flex-col gap-3 rounded-md bg-linear-to-br from-[#3A3760] via-[#2B2A47] to-[#211F3A] p-6">
        <Heading>{travel.title}</Heading>
        <div className="flex flex-row">
          <Tag icon={<Icon name="cal" size={14} />} tone="inverse">
            {dateLabels}
          </Tag>
          <Tag
            icon={<Icon name="car" size={14} />}
            tone="inverse"
          >{`${totalKms} kms`}</Tag>
        </div>
        <Button variant="outline" className="right-3">
          Ouvrir le voyage
        </Button>
      </div>
    </>
  );
}
