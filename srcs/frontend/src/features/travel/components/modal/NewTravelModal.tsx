import { ChoiceScreen } from "@/features/travel/components/modal/ChoiceScreen";
import { CreatedScreen } from "@/features/travel/components/modal/CreatedScreen";
import { FormScreen } from "@/features/travel/components/modal/FormScreen";
import type { Travel } from "@/features/travel/types";
import Modal from "@/shared/ui/Modal";
import { useState } from "react";

type Screen = "choice" | "form" | "created";

export interface NewTravelModalProps {
  onClose: () => void;
  refetch: () => void;
}

export function NewTravelModal({ onClose, refetch }: NewTravelModalProps) {
  const [screen, setScreen] = useState<Screen>("choice");
  const [created, setCreated] = useState<Travel | null>(null);

  const handleCreated = (travel: Travel) => {
    setCreated(travel);
    refetch();
    setScreen("created");
  };

  const titles: Record<Screen, string> = {
    choice: "Nouveau voyage",
    form: "Crée un voyage",
    created: "Voyage créé",
  };

  return (
    <Modal icon="compass" title={titles[screen]} onClose={onClose}>
      {screen === "choice" && (
        <ChoiceScreen onCreate={() => setScreen("form")} />
      )}
      {screen === "form" && <FormScreen onCreated={handleCreated} />}
      {screen === "created" && created && (
        <CreatedScreen travel={created} onClose={onClose} />
      )}
    </Modal>
  );
}
