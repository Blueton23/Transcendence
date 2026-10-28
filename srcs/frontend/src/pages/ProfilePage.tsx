import { useState } from "react";

import ProfileInfo from "../features/profile/components/ProfileInfo";
import Modify from "../features/profile/components/Modify";
import FriendList from "../features/friendship/components/FriendList";
import FriendRequests from "../features/friendship/components/FriendRequests";
import FriendSearch from "../features/friendship/components/FriendSearch";

import Button from "../shared/ui/Button";
import Modal from "../shared/ui/Modal";
import { useTranslation } from "react-i18next";
import {
  useNotificationEvent,
  useNotificationSocketOpen,
} from "../features/notifications/realtime/useNotificationSocket";

function ProfilePage() {
  const [isModifyOpen, setIsModifyOpen] = useState(false);
  const [friendsRefreshKey, setFriendsRefreshKey] = useState(0);
  const { t } = useTranslation();

  function refreshFriends() {
    setFriendsRefreshKey((current) => current + 1);
  }

  // Someone else sent, accepted, declined or removed a friendship (or this
  // user did, in another tab): reload both lists.
  useNotificationSocketOpen(refreshFriends);
  useNotificationEvent("friendship.requested", refreshFriends);
  useNotificationEvent("friendship.accepted", refreshFriends);
  useNotificationEvent("friendship.removed", refreshFriends);

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

      <FriendRequests
        refreshKey={friendsRefreshKey}
        onFriendAccepted={refreshFriends}
      />

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
