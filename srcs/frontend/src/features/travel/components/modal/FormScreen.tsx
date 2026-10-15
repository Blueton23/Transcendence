import { DateRangeField } from "@/shared/ui/DateRangeField";
import { formatDateRange } from "@/features/step/utils/stepDates";
import { useTravelForm } from "@/features/travel/hooks/useTravelForm";
import type { Travel } from "@/features/travel/types";
import Button from "@/shared/ui/Button";
import { DatePicker } from "@/shared/ui/DatePicker";
import Input from "@/shared/ui/Input";
import Text from "@/shared/ui/Text";
import Card from "@/shared/ui/Card";
import Icon from "@/shared/ui/Icon";

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
      <DateRangeField
        label={formatDateRange(form.dates)}
        onClick={() => form.setCalendarOpen((open) => !open)}
      />
      {form.calendarOpen && (
        <Card variant="default" className="z-20 mt-2 flex flex-col gap-4 p-6">
          <div className="flex justify-center">
            <div className="flex flex-col gap-2"></div>
            <DatePicker
              selected={form.dates}
              onSelect={(range) => {
                form.setDates(range);
              }}
            />
          </div>
        </Card>
      )}
      <Button
        icon={<Icon name="plus" size={18} />}
        onClick={form.handleSubmit}
        disabled={form.isSubmitting}
        type="submit"
        variant="primary"
        className="w-full md:text-md"
      >
        {form.isSubmitting ? "Modifications en cours" : "Créer mon voyage"}
      </Button>
      {form.error && <Text tone="accent">{form.error}</Text>}
    </div>
  );
}
