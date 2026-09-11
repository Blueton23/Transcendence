import IconButton from "@/shared/ui/IconButton";
import Heading from "@/shared/ui/Heading";
import Icon from "@/shared/ui/Icon";
import Button from "@/shared/ui/Button";

export function StepDetailHeader({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center gap-5">
        <IconButton
          variant="flat"
          icon={<Icon name="back" size={16} />}
          label="Retour à l'itinéraire"
          onClick={onBack}
        />
        <Heading size="md">Détail d'étape</Heading>
      </div>
      <Button variant="ghost" icon={<Icon name="edit" size={16} />}>
        Modifier
      </Button>
    </div>
  );
}
