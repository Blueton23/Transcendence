import Card from "@/shared/ui/Card";
import Heading from "@/shared/ui/Heading";
import Text from "@/shared/ui/Text";
import Icon from "@/shared/ui/Icon";
import { useState } from "react";
import { useSubmitAction } from "@/shared/hooks/useSubmitAction";
import type { Step } from "@/features/step/types";
import { useTranslation } from "react-i18next";
import { OptionsMenu } from "@/shared/ui/OptionsMenu";

interface StepCardProps {
  step: Step;
  dateLabel: string;
  lodging?: { lodged: number; total: number };
  onModify: () => void;
  onClick?: () => void;
  onDelete: () => Promise<void>;
}

function StepDescription({
  step,
  lodging,
}: Pick<StepCardProps, "step" | "lodging">) {
  const { t } = useTranslation();
  return (
    <Text tone="muted" size="sm">
      {t("units.nights", { count: step.nights })}
      {lodging &&
        lodging.total > 0 &&
        ` · ${t("step.lodgedRatio", { lodged: lodging.lodged, total: lodging.total })}`}
      {` · ${t("step.pinnedIdeas", { count: step.ideaCount })}`}
    </Text>
  );
}

//possible decrire function StepCard(props: StepCardProps) et utiliser props.step, props.dateLabel....
export function StepCard({
  step,
  dateLabel,
  lodging,
  onClick,
  onModify,
  onDelete,
}: StepCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  const { submit, isSubmitting } = useSubmitAction(onDelete);

  const StepOptionsStyle =
    "absolute top-3 right-3 opacity-0 transition-opacity group-hover:opacity-100";

  return (
    <Card
      variant="default"
      interactive={true}
      className={`group relative flex-1 ${isOpen ? "z-20" : ""}`}
      onClick={onClick}
    >
      <Text font="mono">{dateLabel}</Text>
      <div className="flex items-center">
        <Heading level={2}>{step.localisation}</Heading>
      </div>
      <div className="flex items-center">
        <StepDescription step={step} lodging={lodging} />
        <Icon name="arrow" size={17} className="ml-auto text-muted" />
      </div>
      <div className={StepOptionsStyle}>
        <OptionsMenu
          editLabel={t("step.edit")}
          deleteLabel={t("step.delete")}
          disabled={isSubmitting}
          onEdit={onModify}
          onDelete={() => void submit()}
          onOpenChange={setIsOpen}
        />
      </div>
    </Card>
  );
}
