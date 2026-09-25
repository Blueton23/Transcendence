import { useState } from "react";

import ProfileInfo from "../features/profile/components/ProfileInfo";
import Modify from "../features/profile/components/Modify";

import Button from "../shared/ui/Button";
import Modal from "../shared/ui/Modal";

function ProfilePage() {
  const [isModifyOpen, setIsModifyOpen] = useState(false);

  return (
    <div className="flex w-full flex-col gap-6 p-8">
      <div className="flex w-full items-center justify-between">
        <ProfileInfo />

        <Button
          type="button"
          variant="primary"
          onClick={() => setIsModifyOpen(true)}
        >
          Modifier le profil
        </Button>
      </div>

      {isModifyOpen && (
        <Modal
          icon="edit"
          title="Modifier le profil"
          onClose={() => setIsModifyOpen(false)}
        >
          <Modify onSuccess={() => setIsModifyOpen(false)} />
        </Modal>
      )}
    </div>
  );
}

export default ProfilePage;
