import IconBadge from "@/shared/ui/IconBadge";
import Heading from "@/shared/ui/Heading";
import Text from "@/shared/ui/Text";
import type { Step } from "@/features/step/types";
import { useTranslation } from "react-i18next";

interface StepInfoProps {
  step: Step;
  dateLabel: string;
}

export function StepInfo({ step, dateLabel }: StepInfoProps) {
  const { t } = useTranslation();
  return (
    <div>
      <div className="flex items-center gap-4">
        <IconBadge name="pin" />
        <div className="flex flex-col">
          <Heading level={1} size="sm">
            {step.localisation}
          </Heading>
          <Text font="mono" tone="muted" size="sm">
            {dateLabel} ·{" "}
            <span className="uppercase">
              {t("units.nights", { count: step.nights })}
            </span>
          </Text>
        </div>
      </div>
    </div>
  );
}
