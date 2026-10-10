import { useState } from "react";
import type { Idea, PlaceIdeaInput, StepOption } from "@/features/idea/types";
import { PlaceIdeaForm } from "@/features/idea/components/forms/PlaceIdeaForm";
import type { DateRange } from "@daypicker/react";
import { formatDateToISO } from "@/features/idea/utils/formatDate";
import { useSubmitAction } from "@/shared/hooks/useSubmitAction";
import Text from "@/shared/ui/Text";
import Modal from "@/shared/ui/Modal";
import Button from "@/shared/ui/Button";

interface PlaceIdeaModalProps {
  idea: Idea;
  steps: StepOption[];
  onClose: () => void;
  onPlace: (ideaId: Idea["id"], input: PlaceIdeaInput) => Promise<void>;
}

export function PlaceIdeaModal({
  idea,
  steps,
  onClose,
  onPlace,
}: PlaceIdeaModalProps) {
  const [stepId, setStepId] = useState<number | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const { submit, isSubmitting, error } = useSubmitAction(async () => {
    const input: PlaceIdeaInput = {
      stepId,
      date:
        idea.type !== "accommodation" && dateRange?.from
          ? formatDateToISO(dateRange.from)
          : null,
    };

    await onPlace(idea.id, input);
  });

  return (
    <Modal
      icon="arrow"
      title="Placer l'idée"
      subtitle={idea.title}
      onClose={() => {
        if (!isSubmitting) {
          onClose();
        }
      }}
    >
      <form
        onSubmit={async (event) => {
          event.preventDefault();

          if (isSubmitting) {
            return;
          }

          const result = await submit();

          if (result.success) {
            onClose();
          }
        }}
      >
        <PlaceIdeaForm
          idea={idea}
          steps={steps}
          stepId={stepId}
          setStepId={setStepId}
          dateRange={dateRange}
          setDateRange={setDateRange}
        />

        {error && (
          <div role="alert">
            <Text tone="accent" className="whitespace-pre-line">
              {error}
            </Text>
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Enregistrement…" : "Enregistrer"}
        </Button>
      </form>
    </Modal>
  );
}

/*
Fonction pour créer la modal "Placer l'idée"
*/
