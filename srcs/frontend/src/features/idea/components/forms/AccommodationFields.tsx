import { useId, useState, type Dispatch, type SetStateAction } from "react";
import type { IdeaFormValues } from "@/features/idea/types";
import { DatePicker } from "@/shared/ui/DatePicker";
import Text from "@/shared/ui/Text";
import Input from "@/shared/ui/Input";
import Icon from "@/shared/ui/Icon";
import Card from "@/shared/ui/Card";
import { useTranslation } from "react-i18next";
import { getDateLocale } from "@/shared/utils/dateLocale";

interface AccommodationFieldsProps {
  values: IdeaFormValues;
  setValues: Dispatch<SetStateAction<IdeaFormValues>>;
  datesError?: string;
  bounds?: { from: Date; to: Date };
}

export function AccommodationFields({
  values,
  setValues,
  datesError,
  bounds,
}: AccommodationFieldsProps) {
  const { t } = useTranslation();
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const datesErrorId = useId();

  return (
    <>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Text size="sm" className="mb-1">
            {t("idea.form.arrival")}
          </Text>

          <Input
            readOnly
            value={
              values.dateRange?.from
                ? values.dateRange.from.toLocaleDateString(getDateLocale())
                : ""
            }
            icon={<Icon name="cal" size={18} />}
            iconLabel={t("idea.form.chooseDates")}
            onIconClick={() => setDatePickerOpen(true)}
            aria-invalid={Boolean(datesError)}
            aria-describedby={datesError ? datesErrorId : undefined}
          />
        </div>

        <div>
          <Text size="sm" className="mb-1">
            {t("idea.form.departure")}
          </Text>

          <Input
            readOnly
            value={
              values.dateRange?.to
                ? values.dateRange.to.toLocaleDateString(getDateLocale())
                : ""
            }
            icon={<Icon name="cal" size={18} />}
            iconLabel={t("idea.form.chooseDates")}
            onIconClick={() => setDatePickerOpen(true)}
            aria-invalid={Boolean(datesError)}
            aria-describedby={datesError ? datesErrorId : undefined}
          />
        </div>
      </div>

      {datesError && (
        <div id={datesErrorId} role="alert">
          <Text tone="accent" size="sm" className="mt-1">
            {datesError}
          </Text>
        </div>
      )}

      {datePickerOpen && (
        <Card variant="default" className={`z-20 mt-2 flex flex-col gap-4 p-6`}>
          <div className="flex justify-center">
            <div className="flex flex-col gap-2">
              <DatePicker
                selected={values.dateRange}
                onSelect={(dateRange) => {
                  setValues((current) => ({
                    ...current,
                    dateRange,
                  }));

                  if (dateRange?.to) {
                    setDatePickerOpen(false);
                  }
                }}
                disabled={
                  bounds ? { before: bounds.from, after: bounds.to } : undefined
                }
                defaultMonth={bounds?.from}
                startMonth={bounds?.from}
                endMonth={bounds?.to}
              />
            </div>
          </div>
        </Card>
      )}

      <Text size="sm" className="mt-3 mb-1">
        {t("idea.form.pricePerNight")}
      </Text>

      <Input
        type="number"
        min={0}
        step="0.01"
        value={values.pricePerNight}
        onChange={(event) =>
          setValues((current) => ({
            ...current,
            pricePerNight: event.target.value,
          }))
        }
        className="mb-3"
      />
    </>
  );
}
