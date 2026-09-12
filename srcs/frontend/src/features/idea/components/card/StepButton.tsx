import Button from "@/shared/ui/Button";
import Icon from "@/shared/ui/Icon";

interface StepButtonProps {
  stepId: number | null;
  onPlace: () => void;
  onView: () => void;
}

export function StepButton({ stepId, onPlace, onView }: StepButtonProps) {
  if (stepId === null) {
    return (
      <Button variant="outline" size="sm" onClick={onPlace}>
        <span className="text-error">Placer</span>
        <Icon name="arrow" size={14} className="text-error" />
      </Button>
    );
  }

  return (
    <Button variant="outline" size="sm" onClick={onView}>
      Voir l'étape
    </Button>
  );
}

/*
Fonction du bouton de droite "Placer" / "Voir l'étape"
*/
