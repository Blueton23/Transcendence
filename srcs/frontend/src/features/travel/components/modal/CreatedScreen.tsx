import type { Travel } from "@/features/travel/types";
import Button from "@/shared/ui/Button";
import Text from "@/shared/ui/Text";

interface CreatedScreenProps {
  travel: Travel;
  onClose: () => void;
}

export function CreatedScreen({ travel, onClose }: CreatedScreenProps) {
  return (
    <div>
      <Text> ton voyage {travel.title} a ete cree </Text>
      <Button variant="primary" className="w-full" onClick={onClose}>
        Terminer
      </Button>
    </div>
  );
}
