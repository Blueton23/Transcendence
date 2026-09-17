import { useState, type Dispatch, type SetStateAction } from "react";
import type { IdeaFormValues } from "@/features/idea/types";
import { DatePicker } from "@/shared/ui/DatePicker";
import Text from "@/shared/ui/Text";
import Icon from "@/shared/ui/Icon";
import Input from "@/shared/ui/Input";

interface DateFieldProps {
  values: IdeaFormValues;
  setValues: Dispatch<SetStateAction<IdeaFormValues>>;
}

export function DateField({ values, setValues }: DateFieldProps) {
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  return (
    <div className="mb-4">
      <Text size="sm" className="mb-1">
        Date
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

      {datePickerOpen && (
        <DatePicker
          singleDay
          selected={values.dateRange}
          onSelect={(dateRange) => {
            setValues((current) => ({
              ...current,
              dateRange,
            }));

            if (dateRange?.from) {
              setDatePickerOpen(false);
            }
          }}
        />
      )}
    </div>
  );
}

/*
Fonction qui active un champ date lors d'un choix de step dans "Epingler une idée"
*/
