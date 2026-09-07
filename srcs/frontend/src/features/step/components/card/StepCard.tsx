import type { Step, StepIdeaPreview } from "@/features/step/types";
import Card from "@/shared/ui/Card";
import Heading from "@/shared/ui/Heading";
import Text from "@/shared/ui/Text";
import IconButton from "@/shared/ui/IconButton";
import Icon from "@/shared/ui/Icon";
import MenuItem from "@/shared/ui/MenuItem";
import DropdownMenu from "@/shared/ui/DropdownMenu";
import { useState } from "react";
import Divider from "@/shared/ui/Divider";

//TODO(branchement): ideaPreview viendra d un champ annote cote API par le biais du Serializer de l app traval
// pas un champ stocke dans Step
interface StepCardProps {
  step: Step;
  dateLabel: string;
  ideaPreview?: StepIdeaPreview;
  ideaCount: number;
  onClick?: () => void;
}

const ideaPreviewTones = {
  proposed: "accent",
  selected: "accent",
  reserved: "success",
} as const;

const StepOptionsStyle =
  "absolute top-3 right-3 opacity-0 transition-opacity group-hover:opacity-100";

function formatNights(nights: number): string {
  if (nights === 0) return "Pas de nuit";
  if (nights === 1) return "1 nuit";
  return `${nights} nuits`;
}

function StepOptionsButton() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className={StepOptionsStyle} onClick={(e) => e.stopPropagation()}>
      <IconButton
        icon={<Icon name="dots" size={16} />}
        label="Options"
        onClick={() => setIsOpen((v) => !v)}
        onMouseDown={(e) => e.stopPropagation()}
      />
      {isOpen && (
        <DropdownMenu
          onClose={() => setIsOpen(false)}
          className="top-full right-0 mt-2"
        >
          <MenuItem icon="edit">Modifier étape</MenuItem>
          <Divider />
          <MenuItem icon="x" tone="danger">
            Supprimer l'étape
          </MenuItem>
        </DropdownMenu>
      )}
    </div>
  );
}

function StepDescription({
  step,
  ideaPreview,
  ideaCount,
}: Pick<StepCardProps, "step" | "ideaPreview" | "ideaCount">) {
  return (
    <Text tone="muted" size="sm">
      {ideaPreview && (
        <>
          <Text as="span" tone={ideaPreviewTones[ideaPreview.status]}>
            {ideaPreview.label}
          </Text>
          {" · "}
        </>
      )}
      {formatNights(step.nights)} · {ideaCount} idées épinglées
    </Text>
  );
}

//possible decrire function StepCard(props: StepCardProps) et utiliser props.step, props.dateLabel....
export function StepCard({
  step,
  dateLabel,
  ideaPreview,
  ideaCount,
  onClick,
}: StepCardProps) {
  return (
    <Card
      variant="default"
      interactive={true}
      className="group relative flex-1"
      onClick={onClick}
    >
      <Text font="mono">{dateLabel}</Text>
      <div className="flex items-center">
        <Heading level={2}>{step.localisation}</Heading>
      </div>
      <div className="flex items-center">
        <StepDescription
          step={step}
          ideaPreview={ideaPreview}
          ideaCount={ideaCount}
        />
        <Icon name="arrow" size={17} className="ml-auto text-muted" />
      </div>
      <StepOptionsButton />
    </Card>
  );
}
