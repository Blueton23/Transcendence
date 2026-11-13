import { ideaTypes, type IdeaFilter } from "@/features/idea/types";
import { dotColors } from "@/shared/utils/dotColors";
import { ideaTypeLabels } from "@/features/idea/utils/ideaTypeLabels";
import Chip from "@/shared/ui/Chip";
import Dot from "@/shared/ui/Dot";
import { useTranslation } from "react-i18next";

interface IdeaTypeFilterProps {
  typeActiveFilter: IdeaFilter;
  onChange: (filter: IdeaFilter) => void;
}

export function IdeaTypeFilter({
  typeActiveFilter,
  onChange,
}: IdeaTypeFilterProps) {
  const { t } = useTranslation();
  return (
    <div className="mb-4 flex flex-wrap gap-2">
      <Chip active={typeActiveFilter === "all"} onClick={() => onChange("all")}>
        {t("idea.filters.allTypes")}
      </Chip>

      {ideaTypes.map((type) => (
        <Chip
          key={type}
          active={typeActiveFilter === type}
          onClick={() => onChange(type)}
          icon={<Dot className={dotColors[type]} />}
        >
          {t(ideaTypeLabels[type])}
        </Chip>
      ))}
    </div>
  );
}

/*
Fonction pour filtrer les types dans la page d'idée
*/
