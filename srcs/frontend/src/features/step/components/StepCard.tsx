import type { Step, StepIdeaPreview } from "../types";
import Card from "../../../shared/ui/Card";
import Heading from "../../../shared/ui/Heading";
import Text from "../../../shared/ui/Text";
import IconButton from "../../../shared/ui/IconButton";
import Icon from "../../../shared/ui/Icon";

//TODO(branchement): ideaPreview viendra d un champ annote cote API par le biais du Serializer de l app traval
// pas un champ stocke dans Step
interface StepCardProps {
  step: Step;
  dateLabel: string;
  ideaPreview?: StepIdeaPreview;
  ideaCount: number;
}

const ideaPreviewTones = {
  proposed: "accent",
  selected: "accent",
  reserved: "success",
} as const;

const optionsButtonStyle =
  "absolute top-3 right-3 opacity-0 transition-opacity group-hover:opacity-100";

function formatNights(nights: number): string {
  if (nights === 0) return "Pas de nuit";
  if (nights === 1) return "1 nuit";
  return `${nights} nuits`;
}

function StepOptionsButton() {
  return (
    <IconButton
      icon={<Icon name="dots" size={16} />}
      label="Options"
      className={optionsButtonStyle}
    />
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

function StepPositionBadge({ position }: { position: number }) {
  return (
    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-dark text-sm font-bold text-inverse md:h-8 md:w-8">
      {position}
    </span>
  );
}

//possible decrire function StepCard(props: StepCardProps) et utiliser props.step, props.dateLabel....
function StepCard({ step, dateLabel, ideaPreview, ideaCount }: StepCardProps) {
  return (
    <div className="flex items-start gap-3">
      <StepPositionBadge position={step.position} />
      <Card
        variant="default"
        interactive={true}
        className="group relative flex-1"
      >
        <Text font="mono">{dateLabel}</Text>
        <div className="flex items-center">
          <Heading level={2}>{step.localisation}</Heading>
          <Icon name="arrow" size={17} className="ml-auto text-muted" />
        </div>
        <StepDescription
          step={step}
          ideaPreview={ideaPreview}
          ideaCount={ideaCount}
        />
        <StepOptionsButton />
      </Card>
    </div>
  );
}
export default StepCard;
