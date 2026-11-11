import type { IdeaFilter, IdeaType } from "@/features/idea/types";
import { ideaTypeLabels } from "@/features/idea/utils/ideaTypeLabels";
import Chip from "@/shared/ui/Chip";
import { useTranslation } from "react-i18next";

interface IdeaTypeFilterProps {
  typeActiveFilter: IdeaFilter;
  onChange: (filter: IdeaFilter) => void;
}

const ideaTypes: IdeaType[] = [
  "restaurant",
  "accommodation",
  "activity",
  "sightseeing",
];

const dotColors: Record<IdeaType, string> = {
  restaurant: "bg-idea-restaurant-dot",
  accommodation: "bg-idea-lodging-dot",
  activity: "bg-idea-activity-dot",
  sightseeing: "bg-idea-sightseeing-dot",
};

const dotStyle = "size-2.5 shrink-0 rounded-full";

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
          icon={
            <span
              aria-hidden="true"
              className={`${dotStyle} ${dotColors[type]}`}
            />
          }
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
