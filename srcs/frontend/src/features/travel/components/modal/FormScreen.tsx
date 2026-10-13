import { StepDateField } from "@/features/step/components/modal/StepDateField";
import { formatDateRange } from "@/features/step/utils/stepDates";
import { useTravelForm } from "@/features/travel/hooks/useTravelForm";
import type { Travel } from "@/features/travel/types";
import Button from "@/shared/ui/Button";
import { DatePicker } from "@/shared/ui/DatePicker";
import Input from "@/shared/ui/Input";
import Text from "@/shared/ui/Text";

interface FormScreenProps {
  onCreated: (travel: Travel) => void;
}

export function FormScreen({ onCreated }: FormScreenProps) {
  const form = useTravelForm({ onCreated });
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Text tone="secondary" className="font-semibold">
          Titre du voyage
        </Text>
        <Input
          value={form.title}
          onChange={(event) => form.setTitle(event.target.value)}
          placeholder="Titre de mon voyage"
        />
      </div>
      <StepDateField
        label={formatDateRange(form.dates)}
        onClick={() => form.setCalendarOpen((open) => !open)}
      />
      {form.calendarOpen && (
        <DatePicker
          selected={form.dates}
          onSelect={(range) => {
            form.setDates(range);
            if (range?.from && range?.to) form.setCalendarOpen(false);
          }}
        />
      )}
      <Button
        onClick={form.handleSubmit}
        disabled={form.isSubmitting}
        type="submit"
        variant="primary"
        className="w-full"
      >
        {form.isSubmitting ? "Modifications en cours" : "Creer le voyage"}
      </Button>
      {form.error && <Text tone="accent">{form.error}</Text>}
    </div>
  );
}
