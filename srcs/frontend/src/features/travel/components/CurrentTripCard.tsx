import type { Segment } from "@/features/step/api/segmentApi";
import { computeTotalKms } from "@/features/step/utils/segmentDuration";
import type { Travel } from "@/features/travel/types";
import { computeTravelDates } from "@/features/travel/utils/computeTravelDates";
import { getStatus } from "@/features/travel/utils/getStatus";
import Button from "@/shared/ui/Button";
import Heading from "@/shared/ui/Heading";
import Icon from "@/shared/ui/Icon";
import Tag from "@/shared/ui/Tag";
import { useNavigate } from "react-router";

interface CurrentTripCardProps {
  travel: Travel;
  segments: Segment[];
}

export function CurrentTripCard({ travel, segments }: CurrentTripCardProps) {
  const dateLabels = computeTravelDates(travel.startDate, travel.endDate);
  const totalKms = computeTotalKms(segments);
  const status = getStatus(travel);
  const navigate = useNavigate();
  return (
    <>
      <div className="relative flex flex-col gap-3 rounded-md bg-linear-to-br from-[#3A3760] via-[#2B2A47] to-[#211F3A] p-8">
        <Tag
          tone="inverse"
          className="self-start bg-brand-primary! font-semibold"
        >
          {status}
        </Tag>
        <Heading size="lg" className="text-inverse!">
          {travel.title}
        </Heading>
        <div className="flex gap-2">
          <Tag icon={<Icon name="cal" size={14} />} tone="inverse">
            {dateLabels}
          </Tag>
          <Tag
            icon={<Icon name="car" size={14} />}
            tone="inverse"
          >{`${totalKms} kms`}</Tag>
        </div>
        <Button
          variant="outline"
          className="self-end"
          onClick={() => navigate(`/trip/${travel.id}/`)}
        >
          Ouvrir le voyage
          <Icon name="arrow" />
        </Button>
      </div>
    </>
  );
}
