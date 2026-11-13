import { ideaTypes, type IdeaType } from "@/features/idea/types";
import { ideaTypeLabels } from "@/features/idea/utils/ideaTypeLabels";
import Chip from "@/shared/ui/Chip";
import Icon from "@/shared/ui/Icon";
import { ideaIcons } from "@/features/idea/utils/ideaIcons";
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
      {ideaTypes.map((type) => (
        <Chip
          key={type}
          active={typeActiveFilter === type}
          onClick={() => onChange(type)}
          icon={<Icon name={ideaIcons[type]} size={16} />}
        >
          {t(ideaTypeLabels[type])}
        </Chip>
      ))}
    </div>
  );
}

/*
Fonction pour séléctionner le type dans la modal "Epingler une idée"
*/
