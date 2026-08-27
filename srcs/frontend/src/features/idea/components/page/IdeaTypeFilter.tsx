import Chip from "../../../../shared/ui/Chip";
import Icon from "../../../../shared/ui/Icon";
import type { IdeaFilter } from "../../types";

interface IdeaTypeFilterProps {
  typeActiveFilter: IdeaFilter;
  onChange: (filter: IdeaFilter) => void;
}

export function IdeaTypeFilter({
  typeActiveFilter,
  onChange,
}: IdeaTypeFilterProps) {
  return (
    <div className="mb-8 flex flex-wrap gap-2">
      <Chip active={typeActiveFilter === "all"} onClick={() => onChange("all")}>
        Tous
      </Chip>

      <Chip
        active={typeActiveFilter === "restaurant"}
        onClick={() => onChange("restaurant")}
      >
        <Icon name="fork" size={18} />
        Restaurant
      </Chip>

      <Chip
        active={typeActiveFilter === "accommodation"}
        onClick={() => onChange("accommodation")}
      >
        <Icon name="bed" size={18} />
        Hébérgement
      </Chip>

      <Chip
        active={typeActiveFilter === "activity"}
        onClick={() => onChange("activity")}
      >
        <Icon name="mtn" size={18} />
        Activité
      </Chip>

      <Chip
        active={typeActiveFilter === "sightseeing"}
        onClick={() => onChange("sightseeing")}
      >
        <Icon name="pin" size={18} />A voir
      </Chip>
    </div>
  );
}

/*
Fonction pour filtrer les types dans la page d'idée
*/
