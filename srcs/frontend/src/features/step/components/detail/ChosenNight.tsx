import { IdeaOptionsMenu } from "@/features/idea/components/card/IdeaOptionsMenu";
import type { Idea } from "@/features/idea/types";
import { lodgingCountNights } from "@/features/idea/utils/lodgingCountNights";
import type { IdeaActions } from "@/features/step/types";
import { formatDate } from "@/features/step/utils/stepDates";
import Card from "@/shared/ui/Card";
import Heading from "@/shared/ui/Heading";
import IconBadge from "@/shared/ui/IconBadge";
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
      variant="success"
      className="flex min-w-0 flex-1 items-start justify-between md:items-center"
    >
      <div className="flex flex-1 gap-2 md:gap-3">
        <IconBadge color="chosen" name="bed" />
        <div className="flex flex-col">
          <Heading size="xs" className="text-success-text!">
            {night.title}
          </Heading>
          <div className="flex flex-1">
            <Text tone="success" font="mono">
              {night.pricePerNight &&
                `${t("units.pricePerNight", { price: night.pricePerNight })} · `}
              {lodgingCountNights(night)} · du{" "}
              {night.arrivalDate &&
                night.departureDate &&
                `${formatDate(new Date(night.arrivalDate))} au ${" "}
              ${formatDate(new Date(night.departureDate))}`}
            </Text>
          </div>
        </div>
      </div>
      <IdeaOptionsMenu
        onDelete={() => actions.onDelete(night.id)}
        onEdit={() => actions.onEdit(night.id)}
      />
    </Card>
  );
}
