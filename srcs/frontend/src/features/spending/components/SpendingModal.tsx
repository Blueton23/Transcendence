import Modal from "@/shared/ui/Modal";
import Button from "@/shared/ui/Button";
import Text from "@/shared/ui/Text";
import { useTranslation } from "react-i18next";
import { type Spending } from "@/features/spending/types";
import type { Travel } from "@/features/travel/types";
import { useSpendingForm } from "@/features/spending/hooks/useSpendingForm";
import type { Step } from "@/features/step/types";
import type { Idea } from "@/features/idea/types";
import Input from "@/shared/ui/Input";
import { SpendingCategorySelector } from "@/features/spending/components/SpendingCategorySelector";
import Select from "@/shared/ui/Select";
import Avatar from "@/shared/ui/Avatar";
import { getAvatarColor } from "@/shared/utils/getAvatarColors";

export interface SpendingModalProps {
  spending?: Spending;
  travel: Travel;
  steps: Step[];
  ideas: Idea[];
  onClose: () => void;
  refetch: () => void;
}

export function SpendingModal({
  spending,
  travel,
  steps,
  ideas,
  onClose,
  refetch,
}: SpendingModalProps) {
  const { t } = useTranslation();
  const form = useSpendingForm({
    spending,
    travel,
    onSuccess: () => {
      refetch();
      onClose();
    },
  });

  const filteredIdeas = form.stepId
    ? ideas.filter((i) => i.stepId === form.stepId)
    : ideas;

  return (
    <Modal
      icon="pinplus"
      title={spending ? t("spending.edit") : t("spending.add")}
      onClose={onClose}
      size="narrow"
    >
      <div className="flex flex-col gap-3 md:gap-5">
        <div className="flex flex-col gap-1">
          <Text size="sm">{t("spending.form.amount")}</Text>
          <Input
            type="number"
            step="0.01"
            min="0.01"
            value={form.amount}
            onChange={(e) => form.setAmount(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <Text size="sm">{t("spending.form.label")}</Text>
          <Input
            type="string"
            value={form.label}
            placeholder={t("spending.form.labelPlaceholder")}
            onChange={(e) => form.setLabel(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <Text size="sm">{t("spending.form.category")}</Text>
          <SpendingCategorySelector
            value={form.category}
            onChange={form.setCategory}
          />
        </div>
        <div className="flex flex-col gap-2 md:flex-row">
          <div className="flex flex-1 flex-col gap-1">
            <Text size="sm">{t("spending.form.paidBy")}</Text>
            <Select
              value={form.travelerId ?? 0}
              onChange={(e) => {
                form.setTravelerId(
                  e.target.value === "" ? 0 : Number(e.target.value),
                );
              }}
            >
              {travel.travelers.map((traveler) => (
                <option key={traveler.id} value={traveler.id}>
                  {traveler.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex flex-2 flex-col gap-1">
            <Text size="sm">{t("spending.form.attachedTo")}</Text>
            <Select
              value={form.stepId ?? ""}
              onChange={(e) =>
                form.setStepId(
                  e.target.value === "" ? null : Number(e.target.value),
                )
              }
            >
              <option value="">{t("spending.wholeTravel")}</option>
              {steps.map((step) => (
                <option key={step.id} value={step.id}>
                  {step.localisation}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <Text size="sm">{t("spending.form.ideaLinked")}</Text>
          <Select
            value={form.ideaId ?? ""}
            onChange={(e) => {
              const idea =
                ideas.find((i) => i.id === Number(e.target.value)) ?? null;
              form.selectIdea(idea);
            }}
          >
            <option value="">{t("spending.form.noIdea")}</option>
            {filteredIdeas.map((idea) => (
              <option key={idea.id} value={idea.id}>
                {idea.title}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex flex-col gap-2">
            <Text size="sm">{t("spending.form.sharedWith")}</Text>
            {travel.travelers.map((traveler) => (
              <label key={traveler.id} className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={form.sharedWith.includes(traveler.id)}
                  onChange={() => form.toggleShare(traveler.id)}
                  className="h-4 w-4 accent-brand-primary"
                />
                <Avatar
                  size="sm"
                  color={getAvatarColor(travel.travelers, traveler.id)}
                >
                  {traveler.initials}
                </Avatar>
                <Text>{traveler.name}</Text>
              </label>
            ))}
            {form.sharedWith.length > 0 && Number(form.amount) > 0 && (
              <Text>
                {t("spending.form.perPerson", {
                  count: form.sharedWith.length,
                  amount: (
                    Number(form.amount) / form.sharedWith.length
                  ).toFixed(2),
                })}
              </Text>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Button
            onClick={form.handleSubmit}
            disabled={form.isSubmitting}
            onMouseDown={(e) => e.stopPropagation()}
            type="submit"
            variant="primary"
            className="w-full"
          >
            {form.isSubmitting
              ? t("spending.saving")
              : spending
                ? t("spending.saveChanges")
                : t("spending.submitAdd")}
          </Button>
          {form.error && <Text tone="accent">{form.error}</Text>}
        </div>
      </div>
    </Modal>
  );
}
