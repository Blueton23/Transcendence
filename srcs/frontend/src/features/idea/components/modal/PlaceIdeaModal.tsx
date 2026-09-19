import { useState } from "react";
import type { Idea, PlaceIdeaInput } from "@/features/idea/types";
import type { StepOption } from "@/features/idea/types";
import { PlaceIdeaForm } from "@/features/idea/components/forms/PlaceIdeaForm";
import type { DateRange } from "@daypicker/react";
import { formatDateToISO } from "@/features/idea/utils/formatDate";
import Modal from "@/shared/ui/Modal";
import Button from "@/shared/ui/Button";

interface PlaceIdeaModalProps {
  idea: Idea;
  steps: StepOption[];
  onClose: () => void;
  onPlace: (ideaId: Idea["id"], input: PlaceIdeaInput) => void;
}

export function PlaceIdeaModal({
  idea,
  steps,
  onClose,
  onPlace,
}: PlaceIdeaModalProps) {
  const [stepId, setStepId] = useState<number | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  return (
    <Modal
      icon="arrow"
      title="Placer l'idée"
      subtitle={idea.title}
      onClose={onClose}
    >
      <PlaceIdeaForm
        idea={idea}
        steps={steps}
        stepId={stepId}
        setStepId={setStepId}
        dateRange={dateRange}
        setDateRange={setDateRange}
      />

      <Button
        variant="primary"
        className="w-full"
        disabled={
          stepId === null || (idea.type !== "accommodation" && !dateRange?.from)
        }
        onClick={() => {
          if (stepId === null) {
            return;
          }

          const input: PlaceIdeaInput = {
            stepId,
            date:
              idea.type !== "accommodation" && dateRange?.from
                ? formatDateToISO(dateRange.from)
                : null,
          };

          onPlace(idea.id, input);
          onClose();
        }}
      >
        Enregistrer
      </Button>
    </Modal>
  );
}

/*
Fonction pour créer la modal "Placer l'idée"
*/
