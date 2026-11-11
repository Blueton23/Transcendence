import Icon from "@/shared/ui/Icon";
import Text from "@/shared/ui/Text";
import { useTranslation } from "react-i18next";
import { formatDateRange } from "@/features/step/utils/stepDates";

interface StepLabelProps {
  isInPool: boolean;
  stepName?: string;
  startDate?: string | null;
  endDate?: string | null;
}

export function StepLabel({
  isInPool,
  stepName,
  startDate,
  endDate,
}: StepLabelProps) {
  const { t } = useTranslation();
  if (isInPool) {
    return (
      <Text tone="muted" className="whitespace-nowrap">
        {t("idea.pool")}
      </Text>
    );
  }

  let dateLabel = "";
  if (startDate) {
    dateLabel = formatDateRange({
      from: new Date(startDate),
      to: endDate ? new Date(endDate) : undefined,
    });
  }

  return (
    <div className="flex min-w-0 items-center gap-1">
      <Icon name="pin" size={14} className="shrink-0 text-muted" />
      <Text tone="muted" size="sm" className="truncate">
        {dateLabel ? `${stepName} · ${dateLabel}` : stepName}
      </Text>
    </div>
  );
}

/*
Fonction pour la partie gauche, défini si "pool générale" ou "une étape a afficher"
*/
