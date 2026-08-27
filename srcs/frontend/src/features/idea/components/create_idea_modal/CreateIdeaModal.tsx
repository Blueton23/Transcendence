import { useState } from "react";
import Modal from "../../../../shared/ui/Modal";
import Text from "../../../../shared/ui/Text";
import Select from "../../../../shared/ui/Select";

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
      >
        <option value="">Pool général</option>

        {steps.map((step) => (
          <option key={step.id} value={step.id}>
            {step.name}
          </option>
        ))}
      </Select>
    </Modal>
  );
}
