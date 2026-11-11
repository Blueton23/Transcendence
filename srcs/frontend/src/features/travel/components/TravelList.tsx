import { TravelersStack } from "@/features/travel/components/TravelersStack";
import type { Travel } from "@/features/travel/types";
import { computeTravelDates } from "@/features/travel/utils/computeTravelDates";
import { getStatus } from "@/features/travel/utils/getStatus";
import { getTravelBandColor } from "@/features/travel/utils/getTravelBandColor";
import Card from "@/shared/ui/Card";
import Heading from "@/shared/ui/Heading";
import Icon from "@/shared/ui/Icon";
import IconButton from "@/shared/ui/IconButton";
import Tag from "@/shared/ui/Tag";
import Text from "@/shared/ui/Text";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

interface TravelListProps {
  travels: Travel[];
  onAdd: () => void;
}

export function TravelList({ travels, onAdd }: TravelListProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <div className="grid auto-rows-fr grid-cols-1 gap-2 md:grid-cols-[repeat(auto-fill,minmax(16rem,1fr))]">
      {travels.map((travel) => (
        <Card
          key={travel.id}
          className="flex items-end justify-between gap-3 md:flex-col md:items-start md:justify-start"
          interactive={true}
          onClick={() => navigate(`/travel/${travel.id}/`)}
          band={
            <Tag tone="light" className="font-semibold">
              {getStatus(travel)}
            </Tag>
          }
          bandClassName={getTravelBandColor(travel.id)}
        >
          <div className="flex min-w-0 flex-col">
            <Heading size="sm" className="line-clamp-1">
              {travel.title}
            </Heading>
            <Text>{`${computeTravelDates(travel.startDate, travel.endDate)} · ${t("units.nights", { count: travel.nights })}`}</Text>
          </div>
          <TravelersStack travel={travel} />
        </Card>
      ))}
      <Card
        variant="dashed"
        className="flex cursor-pointer flex-col items-center p-4"
        onClick={onAdd}
      >
        <IconButton
          variant="ghost"
          icon={<Icon name="plus" size={18} />}
          label={t("travel.addTravel")}
          className="text-border-collection!"
        ></IconButton>
        <Heading size="sm" className="text-border-collection!">
          {t("travel.addTravel")}
        </Heading>
      </Card>
    </div>
  );
}
