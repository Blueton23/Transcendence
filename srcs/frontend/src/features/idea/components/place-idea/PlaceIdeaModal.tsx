import { useState } from "react";
import type { Idea } from "../../types";
import type { StepOption } from "../create-idea/CreateIdeaModal";
import { PlaceIdeaForm } from "./PlaceIdeaForm";
import Modal from "../../../../shared/ui/Modal";
import Button from "../../../../shared/ui/Button";

export const ideaTypeLabels = {
  restaurant: "Restaurant",
  accommodation: "Hébergement",
  activity: "Activité",
  sightseeing: "À voir",
} as const;

interface PlaceIdeaModalProps {
  idea: Idea;
  steps: StepOption[];
  onClose: () => void;
  onPlace: (ideaId: Idea["id"], stepId: number) => void;
}

export function PlaceIdeaModal({
  idea,
  steps,
  onClose,
  onPlace,
}: PlaceIdeaModalProps) {
  const [stepId, setStepId] = useState<number | null>(null);

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
      />

      <Button
        variant="primary"
        className="w-full"
        disabled={stepId === null}
        onClick={() => {
          if (stepId === null) {
            return;
          }
          onPlace(idea.id, stepId);
          onClose();
        }}
      >
        Placer
      </Button>
    </Modal>
  );
}
