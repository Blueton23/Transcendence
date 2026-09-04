import { useState } from "react";
import { formatDateToISO } from "../../utils/formatDate";
import type { IdeaType, CreateIdeaInput } from "../../types";
import type { DateRange } from "@daypicker/react";
import { IdeaForm } from "./IdeaForm";
import Modal from "../../../../shared/ui/Modal";
import Button from "../../../../shared/ui/Button";

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
  const [stepId, setStepId] = useState<number | null>(null);
  const [type, setType] = useState<IdeaType>("restaurant");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [note, setNote] = useState("");
  const [pricePerNight, setPricePerNight] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const isAccommodation = type === "accommodation";

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

          const input: CreateIdeaInput = {
            title,
            type,
            stepId,
            url: url === "" ? null : url,
            note: note === "" ? null : note,
            localisation: null,
            latitude: null,
            longitude: null,
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

          onCreate(input);
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
