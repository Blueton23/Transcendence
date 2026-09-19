import { useState } from "react";
import { DatePicker } from "@/shared/ui/DatePicker";
import type { DateRange } from "@daypicker/react";
import Text from "@/shared/ui/Text";
import Icon from "@/shared/ui/Icon";
import Input from "@/shared/ui/Input";

interface DateFieldProps {
  dateRange: DateRange | undefined;
  setDateRange: (dateRange: DateRange | undefined) => void;
}

export function DateField({ dateRange, setDateRange }: DateFieldProps) {
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  return (
    <div className="mb-4">
      <Text size="sm" className="mb-1">
        Date
      </Text>

      <Input
        value={
          dateRange?.from ? dateRange.from.toLocaleDateString("fr-CH") : ""
        }
        icon={<Icon name="cal" size={18} />}
        iconLabel="Ouvrir le calendrier"
        onIconClick={() => setDatePickerOpen(true)}
      />

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
