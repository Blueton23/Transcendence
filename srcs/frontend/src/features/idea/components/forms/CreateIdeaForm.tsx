import { TypeSelector } from "@/features/idea/components/forms/TypeSelector";
import type { StepOption } from "@/features/idea/types";
import type { Dispatch, SetStateAction } from "react";
import type { IdeaFormValues } from "@/features/idea/types";
import { DateField } from "@/features/idea/components/forms/DateField";
import { AccommodationFields } from "@/features/idea/components/forms/AccommodationFields";
import Text from "@/shared/ui/Text";
import Select from "@/shared/ui/Select";
import Input from "@/shared/ui/Input";

interface IdeaFormProps {
  steps: StepOption[];
  values: IdeaFormValues;
  setValues: Dispatch<SetStateAction<IdeaFormValues>>;
}

export function IdeaForm({ steps, values, setValues }: IdeaFormProps) {
  const isAccommodation = values.type === "accommodation";

  return (
    <>
      <Text size="sm" className="mb-1">
        Étape
      </Text>

      <Select
        value={values.stepId ?? ""}
        onChange={(event) =>
          setValues((current) => ({
            ...current,
            stepId:
              event.target.value === "" ? null : Number(event.target.value),
          }))
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

      {values.stepId !== null && !isAccommodation && (
        <DateField values={values} setValues={setValues} />
      )}

      <TypeSelector
        typeActiveFilter={values.type}
        onChange={(type) =>
          setValues((current) => ({
            ...current,
            type,
          }))
        }
      />

      <Text size="sm" className="mb-1">
        Nom
      </Text>

      <Input
        value={values.title}
        onChange={(event) =>
          setValues((current) => ({
            ...current,
            title: event.target.value,
          }))
        }
        className="mb-2"
      />

      <Text size="sm" className="mb-1">
        Lien
      </Text>

      <Input
        value={values.url}
        onChange={(event) =>
          setValues((current) => ({
            ...current,
            url: event.target.value,
          }))
        }
        className="mb-2"
      />

      <Text size="sm" className="mb-1">
        Note
      </Text>

      <Input
        value={values.note}
        onChange={(event) =>
          setValues((current) => ({
            ...current,
            note: event.target.value,
          }))
        }
        className="mb-3"
      />

      {isAccommodation && (
        <AccommodationFields values={values} setValues={setValues} />
      )}
    </>
  );
}

/*
Fonction qui permet de remplir le formulaire "Epingler une idée"
*/
