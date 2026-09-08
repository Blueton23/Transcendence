import IconBadge from "@/shared/ui/IconBadge";
import Heading from "@/shared/ui/Heading";
import Text from "@/shared/ui/Text";
import type { Step } from "@/features/step/types";

interface StepInfoProps {
  step: Step;
  dateLabel: string;
  nights: number;
  hasNights: boolean;
}

export function StepInfo({
  step,
  dateLabel,
  nights,
  hasNights,
}: StepInfoProps) {
  return (
    <div>
      <div className="flex items-center gap-4">
        <IconBadge name="pin" />
        <div className="flex flex-col">
          <Heading level={1} size="sm">
            {step.localisation}
          </Heading>
          <Text font="mono" tone="muted" size="sm">
            {dateLabel} · {hasNights ? `${nights} NUITS` : "PAS DE NUIT"}
          </Text>
        </div>
      </div>
    </div>
  );
}
