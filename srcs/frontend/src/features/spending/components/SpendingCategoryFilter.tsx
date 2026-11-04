import type {
  SpendingCategory,
  SpendingFilter,
} from "@/features/spending/types";
import { spendingCategoryIcons } from "@/features/spending/utils/spendingCategoryIcons";
import { spendingCategoryLabels } from "@/features/spending/utils/spendingCategoryLabels";
import Chip from "@/shared/ui/Chip";
import Icon from "@/shared/ui/Icon";
import { useTranslation } from "react-i18next";

interface SpendingCategoryFilterProps {
  typeActiveFilter: SpendingFilter;
  onChange: (filter: SpendingFilter) => void;
}

export function SpendingCategoryFilter({
  typeActiveFilter,
  onChange,
}: SpendingCategoryFilterProps) {
  const { t } = useTranslation();
  const categories: SpendingCategory[] = ["l", "f", "a", "m", "t", "o"];
  return (
    <div className="mb-4 flex flex-wrap gap-2">
      <Chip active={typeActiveFilter === "all"} onClick={() => onChange("all")}>
        {t("spending.filters.allCategories")}
      </Chip>
      {categories.map((category) => (
        <Chip
          key={category}
          active={typeActiveFilter === category}
          onClick={() => onChange(category)}
          icon={<Icon name={spendingCategoryIcons[category]} size={18} />}
        >
          {t(spendingCategoryLabels[category])}
        </Chip>
      ))}
    </div>
  );
}
