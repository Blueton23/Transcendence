import type { IdeaFilter } from "@/features/idea/types";
import Chip from "@/shared/ui/Chip";
import Icon from "@/shared/ui/Icon";

interface IdeaTypeFilterProps {
  typeActiveFilter: IdeaFilter;
  onChange: (filter: IdeaFilter) => void;
}

export function IdeaTypeFilter({
  typeActiveFilter,
  onChange,
}: IdeaTypeFilterProps) {
  return (
    <div className="mb-4 flex flex-wrap gap-2">
      <Chip active={typeActiveFilter === "all"} onClick={() => onChange("all")}>
        Tous
      </Chip>

      <Chip
        active={typeActiveFilter === "restaurant"}
        onClick={() => onChange("restaurant")}
        icon={<Icon name="fork" size={18} />}
      >
        Restaurant
      </Chip>

      <Chip
        active={typeActiveFilter === "accommodation"}
        onClick={() => onChange("accommodation")}
        icon={<Icon name="bed" size={18} />}
      >
        Hébergement
      </Chip>

      <Chip
        active={typeActiveFilter === "activity"}
        onClick={() => onChange("activity")}
        icon={<Icon name="mtn" size={18} />}
      >
        Activité
      </Chip>

      <Chip
        active={typeActiveFilter === "sightseeing"}
        onClick={() => onChange("sightseeing")}
        icon={<Icon name="pin" size={18} />}
      >
        A voir
      </Chip>
    </div>
  );
}

/*
Fonction pour filtrer les types dans la page d'idée
*/
