import { useState } from "react";
import type {
  CreateIdeaInput,
  IdeaFormValues,
  IdeaType,
} from "@/features/idea/types";
import { CreateIdeaForm } from "@/features/idea/components/forms/CreateIdeaForm";
import { ideaFormInput } from "@/features/idea/utils/ideaFormInput";
import { validateIdeaForm } from "@/features/idea/utils/validateIdeaForm";
import Text from "@/shared/ui/Text";
import Modal from "@/shared/ui/Modal";
import Button from "@/shared/ui/Button";
import type { Step } from "@/features/step/types";
import type { DateRange } from "@daypicker/react";
import { useTranslation } from "react-i18next";

export interface CreateIdeaModalProps {
  travelTitle: string;
  steps: Step[];
  initialStepId?: number;
  initialType?: IdeaType;
  lockStep?: boolean;
  initialDateRange?: DateRange;
  onClose: () => void;
  onCreate: (input: CreateIdeaInput) => Promise<void>;
}

export function CreateIdeaModal({
  travelTitle,
  steps,
  initialStepId,
  initialType,
  lockStep,
  initialDateRange,
  onClose,
  onCreate,
}: CreateIdeaModalProps) {
  const [values, setValues] = useState<IdeaFormValues>({
    stepId: initialStepId ?? null,
    type: initialType ?? "restaurant",
    title: "",
    url: "",
    note: "",
    pricePerNight: "",
    dateRange: initialDateRange ?? undefined,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const { titleError, datesError } = validateIdeaForm(values);
  const { t } = useTranslation();

  return (
    <Modal
      icon="pinplus"
      title="Épingler une idée"
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
            const input = ideaFormInput(values);
            await onCreate(input);
            onClose();
          } catch (err) {
            setSubmitError(
              err instanceof Error
                ? err.message
                : "Impossible de créer l’idée.",
            );
          } finally {
            setIsSubmitting(false);
          }
        }}
      >
        <CreateIdeaForm
          steps={steps}
          values={values}
          lockStep={lockStep}
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
          {isSubmitting ? "Enregistrement…" : `${t("actions.save")}`}
        </Button>
      </form>
    </Modal>
  );
}

/*
Fonction pour créer la modal "Epingler une idée"
*/
