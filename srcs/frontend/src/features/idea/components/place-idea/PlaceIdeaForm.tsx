import type { Idea } from "../../types";
import { ideaTypeLabels } from "./PlaceIdeaModal";
import { ideaIcons } from "../IdeaCard";
import type { StepOption } from "../create-idea/CreateIdeaModal";
import Text from "../../../../shared/ui/Text";
import Select from "../../../../shared/ui/Select";
import Input from "../../../../shared/ui/Input";
import Chip from "../../../../shared/ui/Chip";
import Icon from "../../../../shared/ui/Icon";

interface PlaceIdeaFormProps {
  idea: Idea;
  steps: StepOption[];

  stepId: number | null;
  setStepId: (stepId: number | null) => void;
}

export function PlaceIdeaForm({
  idea,
  steps,
  stepId,
  setStepId,
}: PlaceIdeaFormProps) {
  const isAccommodation = idea.type === "accommodation";

  return (
    <>
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
        <option value="">Choisir une étape</option>

        {steps.map((step) => (
          <option key={step.id} value={step.id}>
            {step.name}
          </option>
        ))}
      </Select>

      <Text tone="primary" size="sm" className="mb-1 text-xs sm:text-sm">
        Type
      </Text>

      <Chip
        disabled
        className="mb-3 cursor-default bg-surface-soft text-muted focus:border-border-control"
      >
        <Icon name={ideaIcons[idea.type]} size={14} />
        {ideaTypeLabels[idea.type]}
      </Chip>

      <Text tone="primary" size="sm" className="mb-1 text-xs sm:text-sm">
        Nom
      </Text>

      <Input
        variant="default"
        value={idea.title}
        readOnly
        className="mb-2 cursor-default bg-surface-soft text-muted focus:border-border-control"
      />

      <Text tone="primary" size="sm" className="mb-1 text-xs sm:text-sm">
        Lien
      </Text>

      <Input
        variant="default"
        value={idea.url ?? ""}
        readOnly
        className="mb-2 cursor-default bg-surface-soft text-muted focus:border-border-control"
      />

      <Text tone="primary" size="sm" className="mb-1 text-xs sm:text-sm">
        Note
      </Text>

      <Input
        variant="default"
        value={idea.note ?? ""}
        readOnly
        className="mb-2 cursor-default bg-surface-soft text-muted focus:border-border-control"
      />

      {isAccommodation && (
        <>
          <Text tone="primary" size="sm" className="mb-1 text-xs sm:text-sm">
            Date d'arrivée
          </Text>

          <Input
            value={idea.arrivalDate ?? ""}
            readOnly
            className="mb-2 cursor-default bg-surface-soft text-muted"
          />

          <Text tone="primary" size="sm" className="mb-1 text-xs sm:text-sm">
            Date de départ
          </Text>

          <Input
            value={idea.departureDate ?? ""}
            readOnly
            className="mb-2 cursor-default bg-surface-soft text-muted"
          />

          <Text tone="primary" size="sm" className="mb-1 text-xs sm:text-sm">
            Prix par nuit
          </Text>

          <Input
            value={
              idea.pricePerNight !== null ? `${idea.pricePerNight} CHF` : ""
            }
            readOnly
            className="mb-3 cursor-default bg-surface-soft text-muted"
          />
        </>
      )}
    </>
  );
}
