import Card from "@/shared/ui/Card";
import Heading from "@/shared/ui/Heading";
import Text from "@/shared/ui/Text";
import Icon from "@/shared/ui/Icon";
import { useState } from "react";
import { useSubmitAction } from "@/shared/hooks/useSubmitAction";
import type { Step } from "@/features/step/types";
import { useTranslation } from "react-i18next";
import { OptionsMenu } from "@/shared/ui/OptionsMenu";
import { getTravelBandColor } from "@/features/travel/utils/getTravelBandColor";
import Tag from "@/shared/ui/Tag";
import { StepPositionBadge } from "@/features/step/components/card/StepPositionBadge";
import { ideaBands } from "@/features/idea/utils/ideaBands";

interface StepCardProps {
  step: Step;
  dateLabel: string;
  lodging?: { lodged: number; total: number };
  index: number;
  onModify: () => void;
  onClick?: () => void;
  onDelete: () => Promise<void>;
}

export function StepCard({
  step,
  dateLabel,
  lodging,
  index,
  onClick,
  onModify,
  onDelete,
}: StepCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  const { submit, isSubmitting, error } = useSubmitAction(onDelete);

  const StepOptionsStyle =
    "absolute top-3 right-3 md:opacity-0 md:transition-opacity md:group-hover:opacity-100";

  return (
    <Card
      interactive
      onClick={onClick}
      band={
        <>
          <StepPositionBadge position={index + 1} />
          <Tag tone="light">{dateLabel}</Tag>
          <Tag tone="light">{t("units.nights", { count: step.nights })}</Tag>
          <Icon name="chev-right" size={18} className="ml-auto" />
        </>
      }
      bandClassName={getTravelBandColor(step.travelId)}
      className={`group relative flex flex-col gap-2 ${isOpen ? "z-20" : ""}`}
    >
      <Heading level={2} size="sm">
        {step.localisation}
      </Heading>
      <div className="flex flex-wrap gap-1.5">
        {lodging && lodging.total > 0 && (
          <Tag
            tone={lodging.lodged === lodging.total ? "plain" : "todo"}
            className={
              lodging.lodged === lodging.total ? ideaBands.accommodation : ""
            }
            icon={<Icon name="tent" size={13} />}
          >
            {t("step.lodgedRatio", {
              lodged: lodging.lodged,
              total: lodging.total,
            })}
          </Tag>
        )}
        <Tag tone="idea">
          {t("step.pinnedIdeas", { count: step.ideaCount })}
        </Tag>
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
      {error && (
        <div role="alert" className="mt-2">
          <Text tone="accent" size="sm" className="whitespace-pre-line">
            {error}
          </Text>
        </div>
      )}
    </Card>
  );
}
