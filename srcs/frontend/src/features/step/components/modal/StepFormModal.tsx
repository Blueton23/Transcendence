import type { Step } from "@/features/step/types";
import Modal from "@/shared/ui/Modal";
import Button from "@/shared/ui/Button";
import Text from "@/shared/ui/Text";
import { PlaceSearchField } from "@/features/step/components/add-step/PlaceSearchField";
import { DatesPanel } from "@/features/step/components/add-step/DatesPanel";
import type { Travel } from "@/features/travel/types";
import { PlaceSuggestions } from "@/features/step/components/add-step/PlaceSuggestions";
import { formatDateRange } from "@/features/step/utils/stepDates";
import { StepDateField } from "@/features/step/components/modal/StepDateField";
import { useStepForm } from "@/features/step/hooks/useStepForm";

export interface StepFormModalProps {
  step?: Step;
  steps: Step[];
  travel: Travel;
  onClose: () => void;
  refetch: () => void;
}

export function StepFormModal({
  step,
  steps,
  travel,
  onClose,
  refetch,
}: StepFormModalProps) {
  const form = useStepForm({
    step,
    travel,
    onSuccess: () => {
      refetch();
      onClose();
    },
  });
  return (
    <Modal
      icon="pinplus"
      title={step ? "Modifier l'étape" : "Ajouter une etape"}
      onClose={onClose}
      size="narrow"
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Text tone="secondary" className="font-semibold">
            Lieu et dates
          </Text>
          <div className="relative">
            <PlaceSearchField
              variant="white"
              value={form.query}
              onChange={(e) => form.changeQuery(e.target.value)}
              onBlur={() =>
                form.setOpenPanel((current) =>
                  current === "place" ? null : current,
                )
              }
              onFocus={() => form.setOpenPanel("place")}
            />
            {form.openPanel === "place" && form.query !== "" && (
              <PlaceSuggestions
                items={form.suggestions}
                isLoading={form.isLoading}
                onSelect={form.selectPlace}
              />
            )}
          </div>
        </div>
        <StepDateField
          label={formatDateRange(form.selected)}
          onClick={() =>
            form.setOpenPanel((current) =>
              current === "calendar" ? null : "calendar",
            )
          }
        />
        {form.openPanel === "calendar" && (
          <DatesPanel
            steps={steps.filter((s) => s.id !== step?.id)}
            travel={travel}
            selected={form.selected}
            className="relative"
            onSelect={form.setSelected}
            noOvernight={form.noOvernight}
            onNoOvernightChange={form.changeNoOvernight}
            onClose={() => form.setOpenPanel(null)}
          />
        )}
        <Button
          onClick={form.handleSubmit}
          disabled={form.isSubmitting}
          onMouseDown={(e) => e.stopPropagation()}
          type="submit"
          variant="primary"
          className="w-full"
        >
          {form.isSubmitting
            ? "Modifications en cours"
            : step
              ? "Enregistrer les modifications"
              : "Ajouter l'étape"}
        </Button>
        {form.error && <Text tone="accent">{form.error}</Text>}
      </div>
    </Modal>
  );
}
