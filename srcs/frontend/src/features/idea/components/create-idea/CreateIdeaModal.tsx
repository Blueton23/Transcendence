import { useState } from "react";
import type { CreateIdeaInput, IdeaFormValues } from "@/features/idea/types";
import { IdeaForm } from "@/features/idea/components/create-idea/IdeaForm";
import { ideaFormInput } from "@/features/idea/utils/ideaFormInput";
import Modal from "@/shared/ui/Modal";
import Button from "@/shared/ui/Button";

export interface StepOption {
  id: number;
  name: string;
}

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
Fonction pour créer la modal "Epingler une idée"
*/
