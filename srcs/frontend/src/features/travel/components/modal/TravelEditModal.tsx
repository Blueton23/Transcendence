import { FormScreen } from "@/features/travel/components/modal/FormScreen";
import type { Travel } from "@/features/travel/types";
import Modal from "@/shared/ui/Modal";
import { useTranslation } from "react-i18next";

interface TravelEditModalProps {
  travel: Travel;
  onClose: () => void;
}

export function TravelEditModal({ travel, onClose }: TravelEditModalProps) {
  const { t } = useTranslation();
  return (
    <Modal icon="cal" title={t("travel.editTravel")} onClose={onClose}>
      <FormScreen travel={travel} onSuccess={onClose} />
    </Modal>
  );
}
