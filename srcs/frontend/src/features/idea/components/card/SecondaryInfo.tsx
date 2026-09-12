import type { IdeaType } from "@/features/idea/types";
import Text from "@/shared/ui/Text";
import Avatar from "@/shared/ui/Avatar";

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
      <div className="flex items-start gap-2 md:items-center">
        <Avatar size="xs" color="2" className="md:size-7 md:text-xs">
          {proposerInitials}
        </Avatar>

        <Text tone="muted" size="sm">
          {pricePerNight} CHF/nuit par {proposerName}
        </Text>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2 md:items-center">
      <Avatar size="xs" color="2" className="md:size-7 md:text-xs">
        {proposerInitials}
      </Avatar>

      <Text tone="muted" size="sm">
        proposée par {proposerName}
      </Text>
    </div>
  );
}

/*
Fonction pour la partie gauche, si c'est un hébérgement , écrit "le prix" / "proposé par"
Si c'est un autre type, met le logo "initiale" / "proposé par"
*/
