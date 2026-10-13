import type { Travel } from "@/features/travel/types";
import Button from "@/shared/ui/Button";
import Input from "@/shared/ui/Input";
import Text from "@/shared/ui/Text";

interface CreatedScreenProps {
  travel: Travel;
  onClose: () => void;
}

//TODO: branchement une fois que friendship est terminé
export function CreatedScreen({ travel, onClose }: CreatedScreenProps) {
  return (
    <div className="flex flex-col gap-3">
      <Text font="mono" tone="muted">
        {" "}
        Invite tes voyageurs pour planifier ensemble {travel.title}
      </Text>
      <div className="flex flex-col items-start gap-1">
        <Text>Rechercher un ami</Text>
        <Input placeholder="Pseudo ou prenom..."></Input>
      </div>
      <div className="flex flex-col items-start gap-1">
        <Text>Lien d'invitation</Text>
        <Input placeholder="Token a copier coller"></Input>
      </div>

      <Button variant="primary" className="w-full" onClick={onClose}>
        Terminer
      </Button>
    </div>
  );
}
