import { categories, type SpendingCategory } from "@/features/spending/types";
import { spendingCategoryIcons } from "@/features/spending/utils/spendingCategoryIcons";
import { spendingCategoryLabels } from "@/features/spending/utils/spendingCategoryLabels";
import Chip from "@/shared/ui/Chip";
import Icon from "@/shared/ui/Icon";
import { useTranslation } from "react-i18next";

interface CategorySelectorProps {
  value: SpendingCategory;
  onChange: (category: SpendingCategory) => void;
}

export function SpendingCategorySelector({
  value,
  onChange,
}: CategorySelectorProps) {
  const { t } = useTranslation();
  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {categories.map((category) => (
        <Chip
          key={category}
          active={value === category}
          onClick={() => onChange(category)}
          icon={<Icon name={spendingCategoryIcons[category]} size={18} />}
        >
          {t(spendingCategoryLabels[category])}
        </Chip>
      ))}
    </div>
  );
}
