import { TravelersStack } from "@/features/travel/components/TravelersStack";
import { TravelOptionsButton } from "@/features/travel/components/TravelOptionsButton";
import type { Travel } from "@/features/travel/types";
import { computeTravelDates } from "@/features/travel/utils/computeTravelDates";
import { getStatus } from "@/features/travel/utils/getStatus";
import { getTravelBandColor } from "@/features/travel/utils/getTravelBandColor";
import Card from "@/shared/ui/Card";
import Heading from "@/shared/ui/Heading";
import Tag from "@/shared/ui/Tag";
import Text from "@/shared/ui/Text";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

interface TravelListProps {
  travels: Travel[];
  onChange: () => void;
}

export function TravelList({ travels, onChange }: TravelListProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <div className="grid auto-rows-fr grid-cols-1 gap-2 sm:grid-cols-[repeat(auto-fill,minmax(16rem,1fr))]">
      {travels.map((travel) => (
        <Card
          key={travel.id}
          className="flex items-end justify-between gap-3 md:flex-col md:items-start md:justify-start"
          interactive={true}
          onClick={() => navigate(`/travel/${travel.id}/`)}
          band={
            <>
              <Tag tone="light" className="font-semibold">
                {getStatus(travel)}
              </Tag>
              <div className="ml-auto">
                <TravelOptionsButton
                  travel={travel}
                  variant="light"
                  onLeave={onChange}
                />
              </div>
            </>
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
    </div>
  );
}
