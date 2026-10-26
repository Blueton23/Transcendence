import type { Idea } from "@/features/idea/types";
import { ideaTypeLabels } from "@/features/idea/utils/ideaTypeLabels";
import { ideaIcons } from "@/features/idea/utils/ideaIcons";
import type { DateRange } from "@daypicker/react";
import { DateField } from "@/features/idea/components/forms/DateField";
import Text from "@/shared/ui/Text";
import Select from "@/shared/ui/Select";
import Input from "@/shared/ui/Input";
import Chip from "@/shared/ui/Chip";
import Icon from "@/shared/ui/Icon";
import type { Step } from "@/features/step/types";
import { useTranslation } from "react-i18next";

interface PlaceIdeaFormProps {
  idea: Idea;
  steps: Step[];

  stepId: number | null;
  setStepId: (stepId: number | null) => void;

  dateRange: DateRange | undefined;
  setDateRange: (dateRange: DateRange | undefined) => void;
}

export function PlaceIdeaForm({
  idea,
  steps,
  stepId,
  setStepId,
  dateRange,
  setDateRange,
}: PlaceIdeaFormProps) {
  const { t } = useTranslation();
  const isAccommodation = idea.type === "accommodation";

  const step = steps.find((s) => s.id === stepId);
  const bounds = step
    ? { from: new Date(step.startDate), to: new Date(step.endDate) }
    : undefined;

  return (
    <>
      <Text size="sm" className="mb-1">
        {t("idea.form.step")}
      </Text>

      <Select
        value={stepId ?? ""}
        onChange={(event) =>
          setStepId(
            event.target.value === "" ? null : Number(event.target.value),
          )
        }
        className="mb-4"
      >
        <option value="">{t("idea.form.chooseStep")}</option>

        {steps.map((step) => (
          <option key={step.id} value={step.id}>
            {step.localisation}
          </option>
        ))}
      </Select>

      {stepId !== null && idea.type !== "accommodation" && (
        <DateField
          dateRange={dateRange}
          setDateRange={setDateRange}
          bounds={bounds}
        />
      )}

      <Text size="sm" className="mb-1">
        {t("idea.form.type")}
      </Text>

      <Chip
        disabled
        className="mb-3"
        icon={<Icon name={ideaIcons[idea.type]} size={14} />}
      >
        {t(ideaTypeLabels[idea.type])}
      </Chip>

      <Text size="sm" className="mb-1">
        {t("idea.form.name")}
      </Text>

      <Input value={idea.title} readOnly className="mb-2" />

      <Text size="sm" className="mb-1">
        {t("idea.form.link")}
      </Text>

      <Input value={idea.url ?? ""} readOnly className="mb-2" />

      <Text size="sm" className="mb-1">
        {t("idea.form.note")}
      </Text>

      <Input value={idea.note ?? ""} readOnly className="mb-2" />

      {isAccommodation && (
        <>
          <Text size="sm" className="mb-1">
            {t("idea.form.arrivalDate")}
          </Text>

          <Input value={idea.arrivalDate ?? ""} readOnly className="mb-2" />

          <Text size="sm" className="mb-1">
            {t("idea.form.departureDate")}
          </Text>

          <Input value={idea.departureDate ?? ""} readOnly className="mb-2" />

          <Text size="sm" className="mb-1">
            {t("idea.form.pricePerNight")}
          </Text>

          <Input
            value={
              idea.pricePerNight !== null ? `${idea.pricePerNight} CHF` : ""
            }
            readOnly
            className="mb-3"
          />
        </>
      )}
    </>
  );
}

/*
Fonction qui permet de remplir le formulaire "Placer l'idée"
*/
