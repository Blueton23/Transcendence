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
  total: string;
}

export function ByCategory({category, total} : ByCategoryProps) {
  const { t } = useTranslation();
  return <Card>
    <IconBadge name={spendingCategoryIcons[category]} siyze="sm"/>
    <Heading>{t(spendingCategoryLabels[category])}</Heading>
    <Text>{total}</Text>
  </Card>;
}
