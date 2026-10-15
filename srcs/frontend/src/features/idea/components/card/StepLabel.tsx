import Tag from "@/shared/ui/Tag";

interface StepLabelProps {
  isInPool: boolean;
  stepName?: string;
}

export function StepLabel({ isInPool, stepName }: StepLabelProps) {
  if (isInPool) {
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
