import Button from "../../../../shared/ui/Button";
import Icon from "../../../../shared/ui/Icon";

interface StepButtonProps {
  stepId: number | null;
  onPlace: () => void;
  onView: () => void;
}

export function StepButton({ stepId, onPlace, onView }: StepButtonProps) {
  if (stepId === null) {
    return (
      <Button
        variant="outline"
        onClick={onPlace}
        className="!px-3 !py-2 !text-xs sm:!px-5 sm:!py-3 sm:!text-sm"
      >
        <span className="text-xs text-error">Placer</span>
        <Icon name="arrow" size={14} className="text-error" />
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      onClick={onView}
      className="!px-3 !py-2 !text-xs sm:!px-5 sm:!py-3 sm:!text-sm"
    >
      Voir l'étape
    </Button>
  );
}

/*
Fonction du bouton "Placer" / "Voir l'étape"
*/
