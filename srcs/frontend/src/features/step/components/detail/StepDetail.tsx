import Heading from "@/shared/ui/Heading";
import Text from "@/shared/ui/Text";
import Card from "@/shared/ui/Card";
import Icon from "@/shared/ui/Icon";
import IconButton from "@/shared/ui/IconButton";
import Button from "@/shared/ui/Button";
import { TripActionsButton } from "@/features/step/components/page/TripActionButton";
import type { Step } from "@/features/step/types";

interface StepDetailProps {
  step: Step;
  dateLabel: string;
  onBack: () => void;
}

function StepDetailHeader({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <IconButton
        variant="flat"
        icon={<Icon name="back" size={16} />}
        label="Retour à l'itinéraire"
        onClick={onBack}
      />
      <Button variant="ghost" icon={<Icon name="edit" size={16} />}>
        Modifier
      </Button>
    </div>
  );
}

// TODO(densité 2): un seul hôtel affiché pour toute l'étape, prix/nuit, statut
// (réservé, PDF joint) — cf. maquette "Interlaken · Chalet Grindelwald · 130 CHF/nuit"
function AccommodationCard() {
  return (
    <Card variant="default">
      <Text tone="muted">Hébergement — à définir</Text>
    </Card>
  );
}

// TODO(densité 2): un bloc par jour (dim 12, lun 13...), avec les idées/activités
// propres à ce jour — cf. maquette "JOUR dim 12 · Rando du Bachalpsee"
function DaysList() {
  return (
    <div className="flex flex-col gap-4">
      <Heading level={2} size="sm">
        Idées
      </Heading>
      <Text tone="muted">Aucune idée épinglée pour l'instant.</Text>
    </div>
  );
}

// TODO(densité 1, étape sans nuit): aperçu de la prochaine étape avec distance/km
// cf. maquette "Prochaine étape · Interlaken · 1h10 · 87 KM"
function NextStepPreview() {
  return <Text tone="muted">Prochaine étape — à venir</Text>;
}

export function StepDetail({ step, dateLabel, onBack }: StepDetailProps) {
  const hasNights = step.nights > 0;

  return (
    <div className="flex flex-col gap-6">
      <StepDetailHeader onBack={onBack} />

      <div>
        <Text font="mono" tone="muted">
          {dateLabel}
        </Text>
        <Heading level={1} size="lg">
          {step.localisation}
        </Heading>
        <Text tone="muted">
          {hasNights
            ? `${step.nights} nuits`
            : "Pas de nuit ici — on prend la route le jour même"}
        </Text>
      </div>

      {hasNights && <AccommodationCard />}

      <DaysList />

      {!hasNights && <NextStepPreview />}

      <TripActionsButton />
    </div>
  );
}
