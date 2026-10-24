import type { IdeaType } from "@/features/idea/types";
import Chip from "@/shared/ui/Chip";
import Icon from "@/shared/ui/Icon";
import { useTranslation } from "react-i18next";

interface TypeSelectorProps {
  typeActiveFilter: IdeaType;
  onChange: (filter: IdeaType) => void;
}

export function TypeSelector({
  typeActiveFilter,
  onChange,
}: TypeSelectorProps) {
  const { t } = useTranslation();
  return (
    <div className="mb-4 flex flex-wrap gap-2">
      <Chip
        active={typeActiveFilter === "restaurant"}
        onClick={() => onChange("restaurant")}
        icon={<Icon name="fork" size={18} />}
      >
        {t("idea.types.restaurant")}
      </Chip>

      <Chip
        active={typeActiveFilter === "accommodation"}
        onClick={() => onChange("accommodation")}
        icon={<Icon name="bed" size={18} />}
      >
        {t("idea.types.accommodation")}
      </Chip>

      <Chip
        active={typeActiveFilter === "activity"}
        onClick={() => onChange("activity")}
        icon={<Icon name="mtn" size={18} />}
      >
        {t("idea.types.activity")}
      </Chip>

      <Chip
        active={typeActiveFilter === "sightseeing"}
        onClick={() => onChange("sightseeing")}
        icon={<Icon name="pin" size={18} />}
      >
        {t("idea.types.sightseeing")}
      </Chip>
    </div>
  );
}

/*
Fonction pour séléctionner le type dans la modal "Epingler une idée"
*/
