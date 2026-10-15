import { useState } from "react";
import type {
  Idea,
  EditIdeaInput,
  IdeaFormValues,
} from "@/features/idea/types";
import { CreateIdeaForm } from "@/features/idea/components/forms/CreateIdeaForm";
import type { StepOption } from "@/features/idea/types";
import { ideaFormInput } from "@/features/idea/utils/ideaFormInput";
import { validateIdeaForm } from "@/features/idea/utils/validateIdeaForm";
import Text from "@/shared/ui/Text";
import Modal from "@/shared/ui/Modal";
import Button from "@/shared/ui/Button";

export interface EditIdeaModalProps {
  travelTitle: string;
  idea: Idea;
  steps: StepOption[];
  onClose: () => void;
  onEdit: (input: EditIdeaInput) => Promise<void>;
}

export function EditIdeaModal({
  travelTitle,
  idea,
  steps,
  onClose,
  onEdit,
}: EditIdeaModalProps) {
  const [values, setValues] = useState<IdeaFormValues>(() => ({
    stepId: idea.stepId,
    type: idea.type,
    title: idea.title,
    url: idea.url ?? "",
    note: idea.note ?? "",
    pricePerNight: idea.pricePerNight?.toString() ?? "",

    dateRange:
      idea.type === "accommodation"
        ? !idea.arrivalDate && !idea.departureDate
          ? undefined
          : {
              from: idea.arrivalDate ? new Date(idea.arrivalDate) : undefined,
              to: idea.departureDate ? new Date(idea.departureDate) : undefined,
            }
        : idea.date
          ? {
              from: new Date(idea.date),
              to: undefined,
            }
          : undefined,
  }));

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const { titleError, datesError } = validateIdeaForm(values);

  const hasTrashedStep = idea.status === "suggested" && idea.stepId !== null;

  if (hasTrashedStep) {
    return (
      <Modal
        icon="pinplus"
        title="Modifier l'idée"
        subtitle={travelTitle}
        onClose={onClose}
      >
        <Text className="mb-4">
          Cette idée est liée à une étape à la corbeille. Restaure cette étape
          ou replace l’idée sur une étape active avant de la modifier.
        </Text>

        <Button
          type="button"
          variant="primary"
          className="w-full"
          onClick={onClose}
        >
          Fermer
        </Button>
      </Modal>
    );
  }

  return (
    <Modal
      icon="pinplus"
      title="Modifier l'idée"
      subtitle={travelTitle}
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

          setHasSubmitted(true);
          setSubmitError(null);

          if (titleError || datesError) {
            return;
          }

          setIsSubmitting(true);

          try {
            const input = ideaFormInput(values, {
              localisation: idea.localisation,
              latitude: idea.latitude,
              longitude: idea.longitude,
            });

            await onEdit(input);
            onClose();
          } catch (err) {
            setSubmitError(
              err instanceof Error
                ? err.message
                : "Impossible de modifier l’idée.",
            );
          } finally {
            setIsSubmitting(false);
          }
        }}
      >
        <CreateIdeaForm
          steps={steps}
          values={values}
          setValues={setValues}
          titleError={hasSubmitted ? titleError : undefined}
          datesError={hasSubmitted ? datesError : undefined}
        />

        {submitError && (
          <div role="alert">
            <Text tone="accent" className="whitespace-pre-line">
              {submitError}
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
Fonction pour créer la modal "Modifier l'idée"
*/
