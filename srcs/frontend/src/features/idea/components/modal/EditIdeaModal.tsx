import { useState } from "react";
import type {
  Idea,
  EditIdeaInput,
  IdeaFormValues,
} from "@/features/idea/types";
import { CreateIdeaForm } from "@/features/idea/components/forms/CreateIdeaForm";

import { ideaFormInput } from "@/features/idea/utils/ideaFormInput";
import { validateIdeaForm } from "@/features/idea/utils/validateIdeaForm";
import Text from "@/shared/ui/Text";
import Modal from "@/shared/ui/Modal";
import Button from "@/shared/ui/Button";
import type { Step } from "@/features/step/types";
import { useTranslation } from "react-i18next";

export interface EditIdeaModalProps {
  travelTitle: string;
  idea: Idea;
  steps: Step[];
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
  const { t } = useTranslation();

  if (hasTrashedStep) {
    return (
      <Modal
        icon="pinplus"
        title={t("idea.editIdea")}
        subtitle={travelTitle}
        onClose={onClose}
      >
        <Text className="mb-4">{t("idea.trashedStep")}</Text>

        <Button
          type="button"
          variant="primary"
          className="w-full"
          onClick={onClose}
        >
          {t("actions.close")}
        </Button>
      </Modal>
    );
  }

  return (
    <Modal
      icon="pinplus"
      title={t("idea.editIdea")}
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
              err instanceof Error ? err.message : t("idea.errors.editFailed"),
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
          {isSubmitting ? `${t("actions.saving")}` : `${t("actions.save")}`}
        </Button>
      </form>
    </Modal>
  );
}

/*
Fonction pour créer la modal "Modifier l'idée"
*/
