import Button from "@/shared/ui/Button";
import Card from "@/shared/ui/Card";
import Divider from "@/shared/ui/Divider";
import Heading from "@/shared/ui/Heading";
import Icon from "@/shared/ui/Icon";
import IconBadge from "@/shared/ui/IconBadge";
import IconButton from "@/shared/ui/IconButton";
import Input from "@/shared/ui/Input";
import Text from "@/shared/ui/Text";

interface ChoiceScreenProps {
  onCreate: () => void;
  onJoin?: () => void;
}

export function ChoiceScreen({ onCreate, onJoin }: ChoiceScreenProps) {
  return (
    <div className="flex flex-col gap-5">
      <Card
        onClick={onCreate}
        className="flex cursor-pointer items-center justify-between"
      >
        <div className="flex items-center gap-5">
          <IconBadge name="compass" />
          <Heading size="sm"> Créer un voyage</Heading>
        </div>
        <IconButton
          variant="ghost"
          icon={<Icon name="arrow" />}
          label="continue"
        />
      </Card>
      <Divider />
      <Text>J'ai un lien d'invitation</Text>
      <div className="flex flex-col gap-4 md:flex-row md:gap-2">
        <Input placeholder="peripl.app/rejoindre/…"></Input>
        <Button variant="dark" onClick={onJoin}>
          Continuer
        </Button>
      </div>
    </div>
  );
}
