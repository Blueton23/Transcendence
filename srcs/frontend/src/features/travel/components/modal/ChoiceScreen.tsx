import Card from "@/shared/ui/Card";
import Heading from "@/shared/ui/Heading";
import Icon from "@/shared/ui/Icon";
import IconBadge from "@/shared/ui/IconBadge";
import IconButton from "@/shared/ui/IconButton";

interface ChoiceScreenProps {
  onCreate: () => void;
  onJoin?: () => void;
}

export function ChoiceScreen({ onCreate, onJoin }: ChoiceScreenProps) {
  return (
    <>
      <Card onClick={onCreate} className="flex justify-between">
        <IconBadge name="compass" />
        <Heading> Creer un voyage</Heading>
        <IconButton
          variant="ghost"
          icon={<Icon name="arrow" />}
          label="continue"
        />
      </Card>
      <Card onClick={onJoin}>
        <IconBadge name="compass" />
        <Heading> Creer un voyage</Heading>
        <IconButton icon="arrow" label="continue" />
      </Card>
    </>
  );
}
