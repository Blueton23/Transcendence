import { useId, useState } from "react";
import { DatePicker } from "@/shared/ui/DatePicker";
import type { DateRange } from "@daypicker/react";
import Text from "@/shared/ui/Text";
import Icon from "@/shared/ui/Icon";
import Input from "@/shared/ui/Input";
import Card from "@/shared/ui/Card";

interface DateFieldProps {
  dateRange: DateRange | undefined;
  setDateRange: (dateRange: DateRange | undefined) => void;
  datesError?: string;
  bounds?: { from: Date; to: Date };
}

export function DateField({
  dateRange,
  setDateRange,
  datesError,
  bounds,
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
        <Card variant="default" className={`z-20 mt-2 flex flex-col gap-4 p-6`}>
          <div className="flex justify-center">
            <div className="flex flex-col gap-2">
              <DatePicker
                singleDay
                selected={dateRange}
                onSelect={(newDateRange) => {
                  setDateRange(newDateRange);

                  if (newDateRange?.from) {
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
    </div>
  );
}

/*
Fonction qui active un champ date lors d'un choix de step dans "Epingler une idée"
*/
