import type { SpendingCategory } from "@/features/spending/types";
import { spendingCategoryBands } from "@/features/spending/utils/spendingCategoryBands";
import { spendingCategoryLabels } from "@/features/spending/utils/spendingCategoryLabels";
import Card from "@/shared/ui/Card";
import Text from "@/shared/ui/Text";
import { useTranslation } from "react-i18next";

interface ByCategoryProps {
  category: SpendingCategory;
  totalCategory: string;
  total: string;
}

export function ByCategory({
  category,
  totalCategory,
  total,
}: ByCategoryProps) {
  const { t } = useTranslation();
  const percentage = (Number(totalCategory) / Number(total)) * 100;
  return (
    <Card
      band={
        <span className="text-xs font-semibold">
          {t(spendingCategoryLabels[category])}
        </span>
      }
      bandClassName={spendingCategoryBands[category]}
      className="flex min-h-20 flex-col gap-0.5"
    >
      <Text size="lg" font="mono" className="font-semibold">
        {`${totalCategory} CHF`}
      </Text>
      <Text size="sm" tone="muted">
        {Math.round(percentage)} %
      </Text>
    </Card>
  );
}
