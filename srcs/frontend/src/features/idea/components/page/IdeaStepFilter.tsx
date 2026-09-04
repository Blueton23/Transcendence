import type { StepFilter } from "../../types";
import Chip from "../../../../shared/ui/Chip";

interface IdeaStepFilterProps {
  steps: {
    id: number;
    name: string;
  }[];
  stepActiveFilter: StepFilter;
  onChange: (filter: StepFilter) => void;
}

export function IdeaStepFilter({
  steps,
  stepActiveFilter,
  onChange,
}: IdeaStepFilterProps) {
  return (
    <div className="mb-5 flex flex-wrap gap-2">
      <Chip active={stepActiveFilter === "all"} onClick={() => onChange("all")}>
        Toutes
      </Chip>

      {steps.map((step) => (
        <Chip
          key={step.id}
          active={stepActiveFilter === step.id}
          onClick={() => onChange(step.id)}
        >
          {step.name}
        </Chip>
      ))}

      <Chip
        active={stepActiveFilter === "none"}
        onClick={() => onChange("none")}
      >
        Sans étape
      </Chip>
    </div>
  );
}

/*
Fonction pour filtrer les étapes dans la page d'idée
*/
