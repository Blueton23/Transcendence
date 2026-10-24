import Button from "@/shared/ui/Button";
import Icon from "@/shared/ui/Icon";
import { useTranslation } from "react-i18next";

interface StepButtonProps {
  isInPool: boolean;
  onPlace?: () => void;
  onView?: () => void;
  disabled?: boolean;
}

export function StepButton({
  isInPool,
  onPlace,
  onView,
  disabled = false,
}: StepButtonProps) {
  const { t } = useTranslation();
  if (isInPool) {
    return (
      <Button variant="outline" size="sm" onClick={onPlace} disabled={disabled}>
        <span className="text-error">{t("idea.place")}</span>
        <Icon name="arrow" size={14} className="text-error" />
      </Button>
    );
  }

  return (
    <Button variant="outline" size="sm" onClick={onView}>
      {t("idea.viewStep")}
    </Button>
  );
}

/*
Fonction du bouton de droite "Placer" / "Voir l'étape"
*/
