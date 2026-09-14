import { useState, type Dispatch, type SetStateAction } from "react";
import type { IdeaFormValues } from "@/features/idea/types";
import { DatePicker } from "@/shared/ui/DatePicker";
import Text from "@/shared/ui/Text";
import Input from "@/shared/ui/Input";
import Icon from "@/shared/ui/Icon";

interface AccommodationFieldsProps {
  values: IdeaFormValues;
  setValues: Dispatch<SetStateAction<IdeaFormValues>>;
}

export function AccommodationFields({
  values,
  setValues,
}: AccommodationFieldsProps) {
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  return (
    <>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Text size="sm" className="mb-1">
            Arrivée
          </Text>

          <Input
            readOnly
            value={
              values.dateRange?.from
                ? values.dateRange.from.toLocaleDateString("fr-CH")
                : ""
            }
            onClick={() => setDatePickerOpen(true)}
          />

          <Icon name="cal" size={18} />
        </div>

        <div>
          <Text size="sm" className="mb-1">
            Départ
          </Text>

          <Input
            readOnly
            value={
              values.dateRange?.to
                ? values.dateRange.to.toLocaleDateString("fr-CH")
                : ""
            }
            onClick={() => setDatePickerOpen(true)}
          />

          <Icon name="cal" size={18} />
        </div>
      </div>

      {datePickerOpen && (
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
        />
      )}

      <Text size="sm" className="mt-3 mb-1">
        Prix par nuit
      </Text>

      <Input
        type="number"
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
