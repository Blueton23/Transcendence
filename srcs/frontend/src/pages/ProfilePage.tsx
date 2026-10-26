import { useState } from "react";

import ProfileInfo from "../features/profile/components/ProfileInfo";
import Modify from "../features/profile/components/Modify";
import FriendList from "../features/friendship/components/FriendList";
import FriendRequests from "../features/friendship/components/FriendRequests";
import FriendSearch from "../features/friendship/components/FriendSearch";

import Button from "../shared/ui/Button";
import Modal from "../shared/ui/Modal";
import { useTranslation } from "react-i18next";

function ProfilePage() {
  const [isModifyOpen, setIsModifyOpen] = useState(false);
  const [friendsRefreshKey, setFriendsRefreshKey] = useState(0);
  const { t } = useTranslation();

  function handleFriendAccepted() {
    setFriendsRefreshKey((current) => current + 1);
  }

  return (
    <div className="flex w-full flex-col gap-6 p-8">
      <div className="flex w-full items-center justify-between">
        <ProfileInfo />

        <Button
          type="button"
          variant="dark"
          onClick={() => setIsModifyOpen(true)}
        >
          {t("profile.editProfile")}
        </Button>
      </div>

      <FriendSearch />

      <FriendRequests onFriendAccepted={handleFriendAccepted} />

      <FriendList refreshKey={friendsRefreshKey} />

      {isModifyOpen && (
        <Modal
          icon="edit"
          title={t("profile.editProfile")}
          onClose={() => setIsModifyOpen(false)}
        >
          <Modify onSuccess={() => setIsModifyOpen(false)} />
        </Modal>
      )}
    </div>
  );
}

export default ProfilePage;
