import { TypeSelector } from "./TypeSelector";
import { DatePicker } from "../../../../shared/ui/DatePicker";
import type { IdeaType } from "../../types";
import type { DateRange } from "@daypicker/react";
import Text from "../../../../shared/ui/Text";
import Select from "../../../../shared/ui/Select";
import Input from "../../../../shared/ui/Input";
import type { StepOption } from "./CreateIdeaModal";

interface IdeaFormProps {
  steps: StepOption[];

  stepId: number | null;
  setStepId: (stepId: number | null) => void;

  type: IdeaType;
  setType: (type: IdeaType) => void;

  title: string;
  setTitle: (title: string) => void;

  url: string;
  setUrl: (url: string) => void;

  note: string;
  setNote: (note: string) => void;

  pricePerNight: string;
  setPricePerNight: (price: string) => void;

  dateRange: DateRange | undefined;
  setDateRange: (dateRange: DateRange | undefined) => void;
}

export function IdeaForm({
  steps,
  stepId,
  setStepId,
  type,
  setType,
  title,
  setTitle,
  url,
  setUrl,
  note,
  setNote,
  pricePerNight,
  setPricePerNight,
  dateRange,
  setDateRange,
}: IdeaFormProps) {
  const isAccommodation = type === "accommodation";

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
            className="mt-3 mb-1 text-xs sm:text-sm"
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
    </>
  );
}
