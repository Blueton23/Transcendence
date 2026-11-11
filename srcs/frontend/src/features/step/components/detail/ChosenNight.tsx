import type { Idea } from "@/features/idea/types";
import { lodgingCountNights } from "@/features/idea/utils/lodgingCountNights";
import type { IdeaActions } from "@/features/step/types";
import { formatDate } from "@/features/step/utils/stepDates";
import Card from "@/shared/ui/Card";
import Heading from "@/shared/ui/Heading";
import Icon from "@/shared/ui/Icon";
import { OptionsMenu } from "@/shared/ui/OptionsMenu";
import Text from "@/shared/ui/Text";
import { useTranslation } from "react-i18next";

interface ChosenNightProps {
  night: Idea;
  actions: IdeaActions;
}

export function ChosenNight({ night, actions }: ChosenNightProps) {
  const { t } = useTranslation();
  return (
    <Card
      variant="accomodation"
      className="flex min-w-0 flex-1 items-start justify-between md:items-center"
    >
      <div className="flex flex-1 items-center gap-2 md:gap-3">
        <Icon name="tent" />
        <div className="flex flex-col">
          <Heading size="xs">{night.title}</Heading>
          <div className="flex flex-1">
            <Text font="sans">
              {night.pricePerNight &&
                `${t("units.pricePerNight", { price: night.pricePerNight })} · `}
              {lodgingCountNights(night)} {" · "}
              {night.arrivalDate &&
                night.departureDate &&
                `${t("step.fromTo", { start: formatDate(new Date(night.arrivalDate)), end: formatDate(new Date(night.departureDate)) })}`}
            </Text>
          </div>
        </div>
      </div>
      <OptionsMenu
        onDelete={() => actions.onDelete(night.id)}
        onEdit={() => actions.onEdit(night.id)}
        variant="ghost"
      />
    </Card>
  );
}
