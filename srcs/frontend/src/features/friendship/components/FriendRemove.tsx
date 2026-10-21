import { useSubmitAction } from "@/shared/hooks/useSubmitAction";

import { removeFriendRequest } from "../api/friendship";

import Button from "@/shared/ui/Button";
import Text from "@/shared/ui/Text";
import Modal from "@/shared/ui/Modal";
import { useTranslation } from "react-i18next";

interface FriendRemoveProps {
  friendshipId: number;
  username: string;
  onCancel: () => void;
  onRemoved: (friendshipId: number) => void;
}

function FriendRemove({
  friendshipId,
  username,
  onCancel,
  onRemoved,
}: FriendRemoveProps) {
  const {
    submit: submitRemove,
    isSubmitting,
    error,
  } = useSubmitAction(async () => {
    return removeFriendRequest(friendshipId);
  });

  async function handleRemove() {
    const result = await submitRemove();

    if (result.success) {
      onRemoved(friendshipId);
    }
  }
  const { t } = useTranslation();

  return (
    <Modal
      icon="trash"
      title={`Retirer ${username} de vos amis ?`}
      size="narrow"
      onClose={onCancel}
    >
      <div className="flex flex-col items-center gap-6">
        {error && <Text tone="accent">{error}</Text>}

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="dark"
            disabled={isSubmitting}
            onClick={onCancel}
          >
            {t("actions.cancel")}
          </Button>

          <Button
            type="button"
            variant="danger"
            disabled={isSubmitting}
            onClick={() => void handleRemove()}
          >
            {isSubmitting ? "Suppression..." : "Retirer"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default FriendRemove;
