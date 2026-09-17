import { useState } from "react";
import type { CreateIdeaInput, IdeaFormValues } from "@/features/idea/types";
import { CreateIdeaForm } from "@/features/idea/components/forms/CreateIdeaForm";
import { ideaFormInput } from "@/features/idea/utils/ideaFormInput";
import type { StepOption } from "@/features/idea/types";
import Modal from "@/shared/ui/Modal";
import Button from "@/shared/ui/Button";

export interface CreateIdeaModalProps {
  steps: StepOption[];
  onClose: () => void;
  onCreate: (input: CreateIdeaInput) => void;
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

  return (
    <Modal
      icon="pinplus"
      title="Épingler une idée"
      subtitle="Road trip Suisse"
      onClose={onClose}
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const input = ideaFormInput(values);
          onCreate(input);
          onClose();
        }}
      >
        <CreateIdeaForm steps={steps} values={values} setValues={setValues} />

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={
            values.title.trim() === "" ||
            ((values.stepId !== null || values.type === "accommodation") &&
              (!values.dateRange?.from || !values.dateRange?.to))
          }
        >
          Enregistrer
        </Button>
      </form>
    </Modal>
  );
}

/*
Fonction pour créer la modal "Epingler une idée"
*/
