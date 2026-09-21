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
import { useSubmitAction } from "@/shared/hooks/useSubmitAction";
import { deleteStep } from "@/features/step/api/stepApi";

//TODO(branchement): ideaPreview viendra d un champ annote cote API par le biais du Serializer de l app traval
// pas un champ stocke dans Step
interface StepCardProps {
  step: Step;
  dateLabel: string;
  ideaPreview?: StepIdeaPreview;
  onModify: () => void;
  onClick?: () => void;
  refetch: () => void;
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

interface StepOptionsButtonProps {
  onModify: () => void;
  refetch: () => void;
  stepId: number;
  travelId: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

function StepOptionsButton({
  onModify,
  refetch,
  stepId,
  travelId,
  isOpen,
  setIsOpen,
}: StepOptionsButtonProps) {
  // rajouter error une fois que bandeau error en place
  const { submit, isSubmitting } = useSubmitAction(() =>
    deleteStep(travelId, stepId),
  );

  //A rajouter un bandeau d'erreur en cas d'erreur pour eviter le remplacement de la card
  //if (error) return <p>{error}</p>;

  const handleOnSubmit = async () => {
    const result = await submit();
    if (result.success) refetch();
  };
  return (
    <div className={StepOptionsStyle} onClick={(e) => e.stopPropagation()}>
      <IconButton
        icon={<Icon name="dots" size={16} />}
        label="Options"
        onClick={() => setIsOpen(!isOpen)}
        onMouseDown={(e) => e.stopPropagation()}
      />
      {isOpen && (
        <DropdownMenu
          onClose={() => setIsOpen(false)}
          className="top-full right-0 mt-2"
        >
          <MenuItem onClick={onModify} icon="edit">
            Modifier étape
          </MenuItem>
          <Divider />
          <MenuItem
            icon="x"
            tone="danger"
            onClick={handleOnSubmit}
            disabled={isSubmitting}
          >
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
}: Pick<StepCardProps, "step" | "ideaPreview">) {
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
      {formatNights(step.nights)} · {step.ideaCount} idées épinglées
    </Text>
  );
}

//possible decrire function StepCard(props: StepCardProps) et utiliser props.step, props.dateLabel....
export function StepCard({
  step,
  dateLabel,
  ideaPreview,
  onClick,
  onModify,
  refetch,
}: StepCardProps) {
  const [isOpen, setIsOpen] = useState(false);

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
        <StepDescription step={step} ideaPreview={ideaPreview} />
        <Icon name="arrow" size={17} className="ml-auto text-muted" />
      </div>
      <StepOptionsButton
        onModify={onModify}
        stepId={step.id}
        travelId={step.travelId}
        refetch={refetch}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />
    </Card>
  );
}
