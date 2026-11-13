import Heading from "@/shared/ui/Heading";
import type { Step } from "@/features/step/types";
import { useTranslation } from "react-i18next";
import Card from "@/shared/ui/Card";
import Tag from "@/shared/ui/Tag";
import { getTravelBandColor } from "@/features/travel/utils/getTravelBandColor";

interface StepInfoProps {
  step: Step;
  dateLabel: string;
}

export function StepInfo({ step, dateLabel }: StepInfoProps) {
  const { t } = useTranslation();
  return (
    <Card
      band={
        <>
          <Tag tone="light">{dateLabel}</Tag>
          <Tag tone="light">{t("units.nights", { count: step.nights })}</Tag>
        </>
      }
      bandClassName={getTravelBandColor(step.travelId)}
    >
      <Heading level={1} size="lg" className="md:text-xl!">
        {step.localisation}
      </Heading>
    </Card>
  );
}
