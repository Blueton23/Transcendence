import Tag from "@/shared/ui/Tag";

interface StepLabelProps {
  stepId: number | null;
  stepName?: string;
}

export function StepLabel({ stepId, stepName }: StepLabelProps) {
  if (stepId === null) {
    return (
      <Tag tone="muted" className="whitespace-nowrap">
        Pool Général
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
