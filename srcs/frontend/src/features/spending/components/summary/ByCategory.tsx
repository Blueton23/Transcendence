import type { SpendingCategory } from "@/features/spending/types";
import { spendingCategoryLabels } from "@/features/spending/utils/spendingCategoryLabels";
import Card from "@/shared/ui/Card";
import Heading from "@/shared/ui/Heading";
import Text from "@/shared/ui/Text";
import { useTranslation } from "react-i18next";

interface ByCategoryProps {
  category: SpendingCategory;
  totalCategory: string;
  total: string;
}

const spendingCategoryBands: Record<SpendingCategory, string> = {
  l: "bg-cat-lodging-bg text-cat-lodging",
  m: "bg-cat-meal-bg text-cat-meal",
  a: "bg-cat-activity-bg text-cat-activity",
  f: "bg-cat-fuel-bg text-cat-fuel",
  t: "bg-cat-toll-bg text-cat-toll",
  o: "bg-cat-other-bg text-cat-other",
};

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
      <Heading
        size="sm"
        className="font-mono"
      >{`${totalCategory} CHF`}</Heading>
      <Text tone="muted">{Math.round(percentage)}%</Text>
    </Card>
  );
}
