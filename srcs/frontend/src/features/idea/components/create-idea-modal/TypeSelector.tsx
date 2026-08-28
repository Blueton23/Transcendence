import Chip from "../../../../shared/ui/Chip";
import Icon from "../../../../shared/ui/Icon";
import type { IdeaType } from "../../types";

interface TypeSelectorProps {
  typeActiveFilter: IdeaType;
  onChange: (filter: IdeaType) => void;
}

export function TypeSelector({
  typeActiveFilter,
  onChange,
}: TypeSelectorProps) {
  return (
    <div className="mb-4 flex flex-wrap gap-2">
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
Fonction pour séléctionner le type dans la modal "épingler une idée"
*/