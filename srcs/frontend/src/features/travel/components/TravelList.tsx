import type { Travel } from "@/features/travel/types";
import { computeTravelDates } from "@/features/travel/utils/computeTravelDates";
import { getStatus } from "@/features/travel/utils/getStatus";
import Card from "@/shared/ui/Card";
import Heading from "@/shared/ui/Heading";
import Icon from "@/shared/ui/Icon";
import IconButton from "@/shared/ui/IconButton";
import Tag from "@/shared/ui/Tag";
import Text from "@/shared/ui/Text";
import { formatNights } from "@/shared/utils/formatNights";
import { useNavigate } from "react-router";

interface TravelListProps {
  travels: Travel[];
}

export function TravelList({ travels }: TravelListProps) {
  const navigate = useNavigate();
  return (
    <div className="flex flex-1 flex-col gap-2 md:flex-row">
      {travels.map((travel) => (
        <div key={travel.id}>
          <Card
            variant="accent"
            className="flex cursor-pointer flex-col gap-2 p-4"
            onClick={() => navigate(`/trip/${travel.id}/`)}
          >
            <div className="flex gap-2">
              <Tag tone="muted" className="self-start text-xs! font-semibold">
                {getStatus(travel)}
              </Tag>
              <Tag tone="muted" className="self-start text-xs! font-semibold">
                {formatNights(travel.nights)}
              </Tag>
            </div>
            <Heading size="sm">{travel.title}</Heading>
            <Text>{computeTravelDates(travel.startDate, travel.endDate)}</Text>
          </Card>
        </div>
      ))}
      <Card variant="dashed" className="flex flex-col items-center p-4">
        <IconButton
          variant="ghost"
          icon={<Icon name="plus" size={18} />}
          label="Ajouter une voyage"
          className="text-border-collection!"
        ></IconButton>
        <Heading size="sm" className="text-border-collection!">
          Ajouter un voyage
        </Heading>
      </Card>
    </div>
  );
}
