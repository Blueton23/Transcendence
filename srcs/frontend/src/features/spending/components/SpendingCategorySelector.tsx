import { categories, type SpendingCategory } from "@/features/spending/types";
import { spendingCategoryLabels } from "@/features/spending/utils/spendingCategoryLabels";
import Chip from "@/shared/ui/Chip";
import Dot from "@/shared/ui/Dot";
import { dotColors } from "@/shared/utils/dotColors";
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
          icon={<Dot className={dotColors[category]} />}
        >
          {t(spendingCategoryLabels[category])}
        </Chip>
      ))}
    </div>
  );
}
