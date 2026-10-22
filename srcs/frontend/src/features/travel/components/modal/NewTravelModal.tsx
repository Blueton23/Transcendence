import { ChoiceScreen } from "@/features/travel/components/modal/ChoiceScreen";
import { CreatedScreen } from "@/features/travel/components/modal/CreatedScreen";
import { FormScreen } from "@/features/travel/components/modal/FormScreen";
import type { Travel } from "@/features/travel/types";
import type { IconName } from "@/shared/ui/Icon";
import Modal from "@/shared/ui/Modal";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

type Screen = "choice" | "form" | "created";

export interface NewTravelModalProps {
  onClose: () => void;
  refetch: () => void;
}

export function NewTravelModal({ onClose, refetch }: NewTravelModalProps) {
  const [screen, setScreen] = useState<Screen>("choice");
  const [created, setCreated] = useState<Travel | null>(null);
  const { t } = useTranslation();

  const handleCreated = (travel: Travel) => {
    setCreated(travel);
    refetch();
    setScreen("created");
  };

  const titles: Record<Screen, string> = {
    choice: t("travel.newTravel"),
    form: t("travel.createTravel"),
    created: created
      ? `${t("travel.travelCreated", { title: created.title })}`
      : "",
  };

  const icons: Record<Screen, IconName> = {
    choice: "compass",
    form: "compass",
    created: "check",
  };

  const navigate = useNavigate();
  return (
    <Modal icon={icons[screen]} title={titles[screen]} onClose={onClose}>
      {screen === "choice" && (
        <ChoiceScreen
          onCreate={() => setScreen("form")}
          onJoin={(token) => {
            onClose();
            navigate(`/join/${token}`);
          }}
        />
      )}
      {screen === "form" && <FormScreen onCreated={handleCreated} />}
      {screen === "created" && created && (
        <CreatedScreen travel={created} onClose={onClose} />
      )}
    </Modal>
  );
}
