import type { IdeaType } from "../../types";
import Text from "../../../../shared/ui/Text";
import Avatar from "../../../../shared/ui/Avatar";

interface SecondaryInfoProps {
  ideaType: IdeaType;
  pricePerNight: number | null;
  proposerName: string;
  proposerInitials: string;
}

export function SecondaryInfo({
  ideaType,
  pricePerNight,
  proposerName,
  proposerInitials,
}: SecondaryInfoProps) {
  if (ideaType === "accommodation" && pricePerNight !== null) {
    return (
      <div className="flex items-center gap-2 sm:gap-2">
        <Avatar size="xs" color="2">
          {proposerInitials}
        </Avatar>

        <Text tone="muted" size="sm" className="text-xs sm:text-sm">
          {pricePerNight} CHF/nuit par {proposerName}
        </Text>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 sm:gap-2">
      <Avatar size="xs" color="2">
        {proposerInitials}
      </Avatar>

      <Text tone="muted" size="sm" className="text-xs sm:text-sm">
        proposée par {proposerName}
      </Text>
    </div>
  );
}

/*
Fonction pour la partie gauche, si c'est un hébérgement , écrit "le prix" / "proposé par"
Si c'est un autre type, met le logo "initiale" / "proposé par"
*/
