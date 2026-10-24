import Tag from "@/shared/ui/Tag";
import { useTranslation } from "react-i18next";

interface StepLabelProps {
  isInPool: boolean;
  stepName?: string;
}

export function StepLabel({ isInPool, stepName }: StepLabelProps) {
  const { t } = useTranslation();
  if (isInPool) {
    return (
      <Tag tone="muted" className="whitespace-nowrap">
        {t("idea.pool")}
      </Tag>
    );
  }

  return (
    <Tag tone="muted" className="truncate">
      {`→ ${stepName}`}
    </Tag>
  );
}

/*
Fonction pour la partie gauche, défini si "pool générale" ou "une étape a afficher"
*/
