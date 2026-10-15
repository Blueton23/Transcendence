import { useId, useState } from "react";
import { DatePicker } from "@/shared/ui/DatePicker";
import type { DateRange } from "@daypicker/react";
import Text from "@/shared/ui/Text";
import Icon from "@/shared/ui/Icon";
import Input from "@/shared/ui/Input";

interface DateFieldProps {
  dateRange: DateRange | undefined;
  setDateRange: (dateRange: DateRange | undefined) => void;
  datesError?: string;
}

export function DateField({
  dateRange,
  setDateRange,
  datesError,
}: DateFieldProps) {
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const datesErrorId = useId();

  return (
    <div className="mb-4">
      <Text size="sm" className="mb-1">
        Date
      </Text>

      <Input
        readOnly
        value={
          dateRange?.from ? dateRange.from.toLocaleDateString("fr-CH") : ""
        }
        icon={<Icon name="cal" size={18} />}
        iconLabel="Ouvrir le calendrier"
        onIconClick={() => setDatePickerOpen(true)}
        aria-invalid={Boolean(datesError)}
        aria-describedby={datesError ? datesErrorId : undefined}
      />

      {datesError && (
        <div id={datesErrorId} role="alert">
          <Text tone="accent" size="sm" className="mt-1">
            {datesError}
          </Text>
        </div>
      )}

      {datePickerOpen && (
        <DatePicker
          singleDay
          selected={dateRange}
          onSelect={(newDateRange) => {
            setDateRange(newDateRange);

            if (newDateRange?.from) {
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
