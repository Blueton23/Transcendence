import { useState } from "react";
import { ideaIcons } from "./IdeaCard";
import type { Idea } from "../types";
import type { StepOption } from "./CreateIdeaModal";
import Modal from "../../../shared/ui/Modal";
import Text from "../../../shared/ui/Text";
import Select from "../../../shared/ui/Select";
import Input from "../../../shared/ui/Input";
import Button from "../../../shared/ui/Button";
import Icon from "../../../shared/ui/Icon";
import Chip from "../../../shared/ui/Chip";

const ideaTypeLabels = {
  restaurant: "Restaurant",
  accommodation: "Hébergement",
  activity: "Activité",
  sightseeing: "À voir",
} as const;

interface PlaceIdeaModalProps {
  idea: Idea;
  steps: StepOption[];
  onClose: () => void;
  onPlace: (ideaId: Idea["id"], stepId: number) => void;
}

export function PlaceIdeaModal({
  idea,
  steps,
  onClose,
  onPlace,
}: PlaceIdeaModalProps) {
  const [stepId, setStepId] = useState<number | null>(null);
  const isAccommodation = idea.type === "accommodation";

  return (
    <Modal
      icon="arrow"
      title="Placer l'idée"
      subtitle={idea.title}
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
            event.target.value === ""
              ? null
              : Number(event.target.value),
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

      <Chip disabled className="mb-3 cursor-default bg-surface-soft text-muted focus:border-border-control">
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
            idea.pricePerNight !== null
            ? `${idea.pricePerNight} CHF`
            : ""
          }
            readOnly
          className="mb-3 cursor-default bg-surface-soft text-muted"
          />
        </>
      )}

      <Button
        variant="primary"
        className="w-full"
        disabled={stepId === null}
        onClick={() => {
          if (stepId === null) {
            return;
          }
          onPlace(idea.id, stepId);
          onClose();
        }}
      >
        Placer
      </Button>
    </Modal>
  );
}
