import { useState } from "react";

import ProfileInfo from "../features/profile/components/ProfileInfo";
import Modify from "../features/profile/components/Modify";
import FriendList from "../features/friendship/components/FriendList";
import FriendRequests from "../features/friendship/components/FriendRequests";
import FriendSearch from "../features/friendship/components/FriendSearch";

import Button from "../shared/ui/Button";
import Modal from "../shared/ui/Modal";
import { useAuth } from "@/features/auth/context/useAuth";

function ProfilePage() {
  const [isModifyOpen, setIsModifyOpen] = useState(false);
  const { currentUser } = useAuth();

  return (
    <div className="flex w-full flex-col gap-6 p-8">
      <div className="flex w-full items-center justify-between">
        <ProfileInfo />
        {currentUser && (
          <img
            src={currentUser.profilePicture ?? undefined}
            alt="Photo de profil"
            className="square-full h-15 w-15 object-cover"
          />
        )}
        <Button
          type="button"
          variant="primary"
          onClick={() => setIsModifyOpen(true)}
        >
          Modifier le profil
        </Button>
      </div>

      <FriendSearch />
      <FriendRequests />
      <FriendList />

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
