import { computeTravelDates } from "@/features/travel/utils/computeTravelDates";
import Button from "@/shared/ui/Button";
import Card from "@/shared/ui/Card";
import Icon from "@/shared/ui/Icon";
import Text from "@/shared/ui/Text";
import { useTranslation } from "react-i18next";

interface UnplannedNightsProps {
  start: string;
  end: string;
  nights: number;
  onAdd: () => void;
}
export function UnplannedNights({
  start,
  end,
  nights,
  onAdd,
}: UnplannedNightsProps) {
  const { t } = useTranslation();
  return (
    <Card variant="dashed" className="flex items-center justify-between">
      <div className="flex flex-col">
        <Text font="mono" size="sm" tone="secondary">
          {computeTravelDates(end, start)}
        </Text>
        <Text className="font-semibold text-text-secondary!">
          {t("step.unplannedNights", { count: nights })}
        </Text>
      </div>
      <Button
        size="sm"
        variant="ghost"
        icon={<Icon name="plus" size={16} />}
        onClick={onAdd}
      >
        {t("step.add")}
      </Button>
    </Card>
  );
}
