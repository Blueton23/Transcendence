import { TypeSelector } from "@/features/idea/components/forms/TypeSelector";
import { useId, type Dispatch, type SetStateAction } from "react";
import type { IdeaFormValues } from "@/features/idea/types";
import { DateField } from "@/features/idea/components/forms/DateField";
import { AccommodationFields } from "@/features/idea/components/forms/AccommodationFields";
import Text from "@/shared/ui/Text";
import Select from "@/shared/ui/Select";
import Input from "@/shared/ui/Input";
import type { Step } from "@/features/step/types";
import { useTranslation } from "react-i18next";

interface IdeaFormProps {
  steps: Step[];
  values: IdeaFormValues;
  lockStep?: boolean;
  setValues: Dispatch<SetStateAction<IdeaFormValues>>;
  titleError?: string;
  datesError?: string;
}

export function CreateIdeaForm({
  steps,
  values,
  lockStep,
  setValues,
  titleError,
  datesError,
}: IdeaFormProps) {
  const { t } = useTranslation();
  const isAccommodation = values.type === "accommodation";
  const titleId = useId();
  const titleErrorId = `${titleId}-error`;

  const step = steps.find((s) => s.id === values.stepId);
  const bounds = step
    ? { from: new Date(step.startDate), to: new Date(step.endDate) }
    : undefined;

  return (
    <>
      <Text size="sm" className="mb-1">
        {t("idea.form.step")}
      </Text>

      <Select
        value={values.stepId ?? ""}
        disabled={lockStep}
        onChange={(event) =>
          setValues((current) => ({
            ...current,
            stepId:
              event.target.value === "" ? null : Number(event.target.value),
          }))
        }
        className="mb-4"
      >
        <option value="">{t("idea.pool")}</option>
        {steps.map((step) => (
          <option key={step.id} value={step.id}>
            {step.localisation}
          </option>
        ))}
      </Select>

      {values.stepId !== null && !isAccommodation && (
        <DateField
          dateRange={values.dateRange}
          setDateRange={(dateRange) =>
            setValues((current) => ({
              ...current,
              dateRange,
            }))
          }
          datesError={datesError}
          bounds={bounds}
        />
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

      <label htmlFor={titleId}>
        <Text as="span" size="sm" className="mb-1 block">
          {t("idea.form.name")}
        </Text>
      </label>

      <Input
        id={titleId}
        value={values.title}
        onChange={(event) =>
          setValues((current) => ({
            ...current,
            title: event.target.value,
          }))
        }
        aria-required="true"
        aria-invalid={Boolean(titleError)}
        aria-describedby={titleError ? titleErrorId : undefined}
        className="mb-2"
      />

      {titleError && (
        <div id={titleErrorId} role="alert">
          <Text tone="accent" size="sm" className="mb-2">
            {titleError}
          </Text>
        </div>
      )}

      <Text size="sm" className="mb-1">
        {t("idea.form.link")}
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
        {t("idea.form.note")}
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
        <AccommodationFields
          values={values}
          setValues={setValues}
          datesError={datesError}
          bounds={bounds}
        />
      )}
    </>
  );
}

/*
Fonction qui permet de remplir le formulaire "Epingler une idée"
*/
