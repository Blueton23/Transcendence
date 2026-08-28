import { useState } from "react";
import Modal from "../../../../shared/ui/Modal";
import Text from "../../../../shared/ui/Text";
import Select from "../../../../shared/ui/Select";
import { TypeSelector } from "./TypeSelector";
import type { IdeaType } from "../../types";
import Input from "../../../../shared/ui/Input";
import Button from "../../../../shared/ui/Button";

interface StepOption {
  id: number;
  name: string;
}

interface CreateIdeaModalProps {
  steps: StepOption[];
  onClose: () => void;
}

export function CreateIdeaModal({ steps, onClose }: CreateIdeaModalProps) {
  const [stepId, setStepId] = useState<number | null>(null);
  const [type, setType] = useState<IdeaType>("restaurant");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [note, setNote] = useState("");

  return (
    <Modal
      icon="pinplus"
      title="Épingler une idée"
      subtitle="Road trip Suisse"
      onClose={onClose}
    >
      <Text tone="primary" size="sm" className="mb-1 text-xs sm:text-sm">
        Étape
      </Text>

      <Select
        variant="default"
        value={stepId ?? ""}
        onChange={(event) =>
          setStepId(
            event.target.value === "" ? null : Number(event.target.value),
          )
        }
        className="mb-4"
      >
        <option value="">Pool général</option>

        {steps.map((step) => (
          <option key={step.id} value={step.id}>
            {step.name}
          </option>
        ))}
      </Select>

      <TypeSelector typeActiveFilter={type} onChange={setType}/>

      <Text tone="primary" size="sm" className="text-xs sm:text-sm mb-1" >
        Nom
      </Text>
      <Input variant="default" value={title} onChange={(event) => setTitle(event.target.value)} className="mb-2" />

      <Text tone="primary" size="sm" className="text-xs sm:text-sm mb-1" >
        Lien
      </Text>
      <Input variant="default" value={url} onChange={(event) => setUrl(event.target.value)} className="mb-2" />

      <Text tone="primary" size="sm" className="text-xs sm:text-sm mb-1" >
        Note
      </Text>
      <Input variant="default" value={note} onChange={(event) => setNote(event.target.value)} className="mb-3" />

      <Button variant="primary" className="w-full" >
        Enregistrer
      </Button>

    </Modal>
  );
}
