import type {Step, StepIdeaPreview} from "../types";
import Card from "../../../shared/ui/Card";
import Heading from "../../../shared/ui/Heading";
import Text from "../../../shared/ui/Text";
import Tag from "../../../shared/ui/Tag";
import IconButton from "../../../shared/ui/IconButton";
import Icon from "../../../shared/ui/Icon";


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

function formatNights(nights: number) : string{
	if (nights === 0)  return "Pas de nuit";
	if (nights === 1) return "1 nuit";
	return `${nights} nuits`
}

function StepCard({step, dateLabel, ideaPreview, ideaCount}: StepCardProps){
	return (
		<Card variant="default" interactive={true}>
			<Text font="mono">{dateLabel}</Text>
			<Heading level={2}>{step.localisation}</Heading>
			<Text tone="muted" size="sm">
				{ideaPreview && (
				<>
				<Text as="span" tone={ideaPreviewTones[ideaPreview.status]}>{ideaPreview.label}</Text>
				{"·"}
				</>
			)}
			{formatNights(step.nights)} · {ideaCount} idées épinglées
			</Text>
		</Card>
	); 
}
export default StepCard;
