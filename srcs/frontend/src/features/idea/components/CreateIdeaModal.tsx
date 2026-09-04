import { useState } from "react";
import { TypeSelector } from "../utils/TypeSelector";
import { DatePicker } from "../../../shared/ui/DatePicker";
import { formatDateToISO } from "../utils/formatDate";
import type { IdeaType, CreateIdeaInput } from "../types";
import type { DateRange } from "@daypicker/react";
import Modal from "../../../shared/ui/Modal";
import Text from "../../../shared/ui/Text";
import Select from "../../../shared/ui/Select";
import Input from "../../../shared/ui/Input";
import Button from "../../../shared/ui/Button";

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
                ? Number(pricePerNight) : null,
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

        <TypeSelector typeActiveFilter={type} onChange={setType} />

        <Text tone="primary" size="sm" className="mb-1 text-xs sm:text-sm">
          Nom
        </Text>

        <Input
          variant="default"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="mb-2"
        />

        <Text tone="primary" size="sm" className="mb-1 text-xs sm:text-sm">
          Lien
        </Text>

        <Input
          variant="default"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          className="mb-2"
        />

        <Text tone="primary" size="sm" className="mb-1 text-xs sm:text-sm">
          Note
        </Text>

        <Input
          variant="default"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          className="mb-3"
        />

        {isAccommodation && (
          <>
            <Text tone="primary" size="sm" className="mb-1 text-xs sm:text-sm">
              Dates du séjour
            </Text>
            <DatePicker selected={dateRange} onSelect={setDateRange} />

            <Text
              tone="primary"
              size="sm"
              className="mb-1 mt-3 text-xs sm:text-sm"
            >
              Prix par nuit
            </Text>
            <Input
              variant="default"
              type=""
              value={pricePerNight}
              onChange={(event) => setPricePerNight(event.target.value)}
              className="mb-3"
            />
          </>
        )}

        <Button type="submit" variant="primary" className="w-full" disabled={title.trim() === ""} >
          Enregistrer
        </Button>
      </form>
    </Modal>
  );
}
