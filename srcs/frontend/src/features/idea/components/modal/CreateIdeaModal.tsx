import { useState } from "react";
import type { CreateIdeaInput, IdeaFormValues } from "@/features/idea/types";
import { CreateIdeaForm } from "@/features/idea/components/forms/CreateIdeaForm";
import { ideaFormInput } from "@/features/idea/utils/ideaFormInput";
import type { StepOption } from "@/features/idea/types";
import Text from "@/shared/ui/Text";
import Modal from "@/shared/ui/Modal";
import Button from "@/shared/ui/Button";

export interface CreateIdeaModalProps {
  steps: StepOption[];
  onClose: () => void;
  onCreate: (input: CreateIdeaInput) => Promise<void>;
}

export function CreateIdeaModal({
  steps,
  onClose,
  onCreate,
}: CreateIdeaModalProps) {
  const [values, setValues] = useState<IdeaFormValues>({
    stepId: null,
    type: "restaurant",
    title: "",
    url: "",
    note: "",
    pricePerNight: "",
    dateRange: undefined,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const titleError =
    values.title.trim() === "" ? "Le titre est obligatoire." : undefined;

  return (
    <Modal
      icon="pinplus"
      title="Épingler une idée"
      subtitle="Road trip Suisse"
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

          if (titleError) {
            return;
          }

          setIsSubmitting(true);

          try {
            const input = ideaFormInput(values);
            await onCreate(input);
            onClose();
          } catch (err) {
            setSubmitError(
              err instanceof Error ? err.message : "Impossible de créer l'idée",
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
          disabled={
            isSubmitting ||
            ((values.stepId !== null || values.type === "accommodation") &&
              (!values.dateRange?.from || !values.dateRange?.to))
          }
        >
          {isSubmitting ? "Enregistrement…" : "Enregistrer"}
        </Button>
      </form>
    </Modal>
  );
}

/*
Fonction pour créer la modal "Epingler une idée"
*/
