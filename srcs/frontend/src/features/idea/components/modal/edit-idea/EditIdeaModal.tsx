import { useState } from "react";
import type {
  Idea,
  EditIdeaInput,
  IdeaFormValues,
} from "@/features/idea/types";
import { IdeaForm } from "@/features/idea/components/modal/create-idea/IdeaForm";
import type { StepOption } from "@/features/idea/components/modal/create-idea/CreateIdeaModal";
import { ideaFormInput } from "@/features/idea/utils/ideaFormInput";
import Modal from "@/shared/ui/Modal";
import Button from "@/shared/ui/Button";

export interface EditIdeaModalProps {
  idea: Idea;
  steps: StepOption[];
  onClose: () => void;
  onEdit: (input: EditIdeaInput) => void;
}

export function EditIdeaModal({
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
      !idea.arrivalDate && !idea.departureDate
        ? undefined
        : {
            from: idea.arrivalDate ? new Date(idea.arrivalDate) : undefined,
            to: idea.departureDate ? new Date(idea.departureDate) : undefined,
          },
  }));

  return (
    <Modal
      icon="pinplus"
      title="Modifier l'idée"
      subtitle="Road trip Suisse"
      onClose={onClose}
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const input = ideaFormInput(values, {
            localisation: idea.localisation,
            latitude: idea.latitude,
            longitude: idea.longitude,
          });

          onEdit(input);
          onClose();
        }}
      >
        <IdeaForm steps={steps} values={values} setValues={setValues} />

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={values.title.trim() === ""}
        >
          Enregistrer
        </Button>
      </form>
    </Modal>
  );
}

/*
Fonction pour créer la modal "Modifier l'idée"
*/
