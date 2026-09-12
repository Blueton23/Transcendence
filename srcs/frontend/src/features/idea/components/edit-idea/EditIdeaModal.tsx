import { useState } from "react";
import { formatDateToISO } from "@/features/idea/utils/formatDate";
import type { Idea, IdeaType, EditIdeaInput } from "@/features/idea/types";
import type { DateRange } from "@daypicker/react";
import { IdeaForm } from "@/features/idea/components/create-idea/IdeaForm";
import type { StepOption } from "@/features/idea/components/create-idea/CreateIdeaModal";
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
  const [stepId, setStepId] = useState<number | null>(idea.stepId);
  const [type, setType] = useState<IdeaType>(idea.type);
  const [title, setTitle] = useState(idea.title);
  const [url, setUrl] = useState(idea.url ?? "");
  const [note, setNote] = useState(idea.note ?? "");
  const [pricePerNight, setPricePerNight] = useState(
    idea.pricePerNight?.toString() ?? "",
  );

  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    if (!idea.arrivalDate && !idea.departureDate) {
      return undefined;
    }

    return {
      from: idea.arrivalDate ? new Date(idea.arrivalDate) : undefined,
      to: idea.departureDate ? new Date(idea.departureDate) : undefined,
    };
  });

  const isAccommodation = type === "accommodation";

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

          const input: EditIdeaInput = {
            title,
            type,
            stepId,
            url: url === "" ? null : url,
            note: note === "" ? null : note,
            localisation: idea.localisation,
            latitude: idea.latitude,
            longitude: idea.longitude,
            pricePerNight:
              isAccommodation && pricePerNight !== ""
                ? Number(pricePerNight)
                : null,
            arrivalDate:
              isAccommodation && dateRange?.from
                ? formatDateToISO(dateRange.from)
                : null,
            departureDate:
              isAccommodation && dateRange?.to
                ? formatDateToISO(dateRange.to)
                : null,
          };
          onEdit(input);
          onClose();
        }}
      >
        <IdeaForm
          steps={steps}
          stepId={stepId}
          setStepId={setStepId}
          type={type}
          setType={setType}
          title={title}
          setTitle={setTitle}
          url={url}
          setUrl={setUrl}
          note={note}
          setNote={setNote}
          pricePerNight={pricePerNight}
          setPricePerNight={setPricePerNight}
          dateRange={dateRange}
          setDateRange={setDateRange}
        />

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={title.trim() === ""}
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
