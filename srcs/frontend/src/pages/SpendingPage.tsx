import { useState } from "react";
import { IdeaStepFilter } from "@/features/idea/components/page/IdeaStepFilter";
import type { StepFilter } from "@/features/idea/types";
import { useSteps } from "@/features/step/hooks/useSteps";
import { useTravel } from "@/features/travel/hooks/useTravel";
import Heading from "@/shared/ui/Heading";
import Text from "@/shared/ui/Text";
import { useTranslation } from "react-i18next";
import { useSpendings } from "@/features/spending/hooks/useSpendings";
import { SpendingSummary } from "@/features/spending/components/summary/SpendingSummary";
import { SpendingModal } from "@/features/spending/components/SpendingModal";
import AddExpenseButton from "@/features/spending/components/AddExpenseButton";
import { getPayer } from "@/features/spending/utils/getPayer";
import { SpendingCard } from "@/features/spending/components/SpendingCard";
import { deleteSpending } from "@/features/spending/api/spendingApi";
import { useParams } from "react-router";
import type { SpendingFilter } from "@/features/spending/types";
import { SpendingCategoryFilter } from "@/features/spending/components/SpendingCategoryFilter";
import { filterSpendings } from "@/features/spending/utils/filterSpendings";
import { useIdeas } from "@/features/idea/hooks/useIdeas";

// Fonction principale pour la page idée
export function SpendingPage() {
  const { id } = useParams();
  const travelId = Number(id);

  const { spendings, summary, isLoading, error, refetch } =
    useSpendings(travelId);

  const {
    steps,
    isLoading: isLoadingSteps,
    error: errorSteps,
  } = useSteps(travelId);

  const {
    travel,
    isLoading: isLoadingTravel,
    error: errorTravel,
  } = useTravel(travelId);

  const {
    ideas,
    isLoading: isLoadingIdeas,
    error: errorIdeas,
  } = useIdeas(travelId);

  const { t } = useTranslation();

  const [typeActiveFilter, setTypeActiveFilter] =
    useState<SpendingFilter>("all");
  const [stepActiveFilter, setStepActiveFilter] = useState<StepFilter>("all");
  const filteredSpendings = filterSpendings(
    spendings,
    typeActiveFilter,
    stepActiveFilter,
  );

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [spendingToModify, setSpendingToModify] = useState<number | null>(null);
  const editSpending = spendings.find(
    (spending) => spending.id === spendingToModify,
  );

  if (isLoading || isLoadingSteps || isLoadingTravel || isLoadingIdeas) {
    return null;
  }

  if (error || errorSteps || errorTravel || errorIdeas) {
    return <Text>{error || errorSteps || errorTravel}</Text>;
  }

  if (!travel) {
    return <Text>{t("travel.errors.notFound")}</Text>;
  }
  return (
    <div className="px-4 pt-8 md:px-8">
      <div className="mb-6 flex items-center justify-between">
        <Heading level={1} size="lg">
          {t("nav.expenses")}
        </Heading>
        <AddExpenseButton onClick={() => setIsCreateOpen(true)} />
      </div>

      <div className="flex flex-col gap-5">
        {summary && <SpendingSummary travel={travel} summary={summary} />}
        <div>
          <Text className="mb-1">{t("spending.form.type")}</Text>
          <SpendingCategoryFilter
            typeActiveFilter={typeActiveFilter}
            onChange={setTypeActiveFilter}
          />
        </div>
      </div>
      <div>
        <Text className="mb-1">{t("spending.form.step")}</Text>
        <IdeaStepFilter
          steps={steps}
          stepActiveFilter={stepActiveFilter}
          onChange={setStepActiveFilter}
        />
      </div>
      <div className="flex flex-col gap-3">
        {filteredSpendings.length === 0 && (
          <Text tone="muted">
            {spendings.length === 0
              ? t("spending.page.empty")
              : t("spending.page.noMatch")}
          </Text>
        )}
        {filteredSpendings.map((spending) => {
          const payer = getPayer(travel, summary, spending.travelerId);
          const step = steps.find((s) => s.id === spending.stepId);

          return (
            <SpendingCard
              key={spending.id}
              spending={spending}
              payer={payer}
              stepName={step?.localisation}
              onEdit={() => setSpendingToModify(spending.id)}
              onDelete={async () => {
                await deleteSpending(travelId, spending.id);
                refetch();
              }}
            />
          );
        })}
      </div>

      {(isCreateOpen || spendingToModify) && (
        <SpendingModal
          spending={editSpending ?? undefined}
          travel={travel}
          steps={steps}
          ideas={ideas}
          onClose={() => {
            setIsCreateOpen(false);
            setSpendingToModify(null);
          }}
          refetch={refetch}
        />
      )}
    </div>
  );
}
