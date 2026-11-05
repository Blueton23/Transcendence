import type { SpendingCategory } from "@/features/spending/types";
import { spendingCategoryIcons } from "@/features/spending/utils/spendingCategoryIcons";
import { spendingCategoryLabels } from "@/features/spending/utils/spendingCategoryLabels";
import Card from "@/shared/ui/Card";
import Heading from "@/shared/ui/Heading";
import IconBadge from "@/shared/ui/IconBadge";
import Text from "@/shared/ui/Text";
import { useTranslation } from "react-i18next";

interface ByCategoryProps{
  category: SpendingCategory;
  totalCategory: string;
  total: string;
}

export function ByCategory({category, totalCategory, total} : ByCategoryProps) {
  const { t } = useTranslation();
  const percentage = (Number(totalCategory) / Number(total)) * 100;
  return (
  <Card className="flex flex-col gap-1">
    <IconBadge name={spendingCategoryIcons[category]} size="sm"/>
    <Text tone="secondary" className="font-bold">{t(spendingCategoryLabels[category])}</Text>
    <Heading>{`${totalCategory} CHF`}</Heading>
    <Text font="mono" tone="muted">{percentage.toFixed(1)}%</Text>
  </Card>
  );
}