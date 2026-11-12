import { dotColors } from "@/shared/utils/dotColors";
import { categories, type SpendingFilter } from "@/features/spending/types";
import { spendingCategoryLabels } from "@/features/spending/utils/spendingCategoryLabels";
import Chip from "@/shared/ui/Chip";
import Dot from "@/shared/ui/Dot";
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
          icon={<Dot className={dotColors[category]} />}
        >
          {t(spendingCategoryLabels[category])}
        </Chip>
      ))}
    </div>
  );
}
