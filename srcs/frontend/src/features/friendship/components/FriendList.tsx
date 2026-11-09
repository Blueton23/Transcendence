import { useEffect, useState } from "react";

import type { Friendship } from "../types";
import { getFriends } from "../api/friendship";

import Button from "@/shared/ui/Button";
import Text from "@/shared/ui/Text";
import Avatar from "@/shared/ui/Avatar";
import Icon from "@/shared/ui/Icon";

import FriendRemove from "./FriendRemove";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n";
import Modal from "@/shared/ui/Modal";
import ProfileInfo from "@/features/profile/components/ProfileInfo";

interface FriendListProps {
  refreshKey: number;
}

function FriendList({ refreshKey }: FriendListProps) {
  const [friendships, setFriendships] = useState<Friendship[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileFriendship, setProfileFriendship] = useState<Friendship | null>(
    null,
  );
  const [selectedFriendship, setSelectedFriendship] =
    useState<Friendship | null>(null);

  useEffect(() => {
    async function loadFriends() {
      try {
        const response = await getFriends();
        setFriendships(response.friendships);
        setError(null);
      } catch {
        setError(i18n.t("friendship.errors.loadFailed"));
      }
    }

    void loadFriends();
  }, [refreshKey]);

  function handleRemoved(friendshipId: number) {
    setFriendships((current) =>
      current.filter((friendship) => friendship.friendshipId !== friendshipId),
    );

    setSelectedFriendship(null);
  }

  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <Text tone="muted">
          {t("friendship.myFriends", { count: friendships.length })}
        </Text>
      </div>

      {error && <Text tone="accent">{error}</Text>}

      {friendships.length === 0 ? (
        <Text tone="muted">{t("friendship.noFriends")}</Text>
      ) : (
        <div className="grid gap-3">
          {friendships.map((friendship) => {
            const friend = friendship.friend;

            return (
              <div
                key={friendship.friendshipId}
                className="flex items-center justify-between gap-3 rounded-md border border-border bg-surface-container p-4"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar user={friend} profile />

                  <div className="flex min-w-0 flex-col">
                    <Text>{friend.username}</Text>
                    <Text>{friend.email}</Text>
                  </div>

                  <div>
                    <Button
                      type="button"
                      icon={<Icon name="user" size={16} />}
                      variant="dark"
                      onClick={() => {
                        setProfileFriendship(friendship);
                        setIsProfileOpen(true);
                      }}
                    >
                      {t("nav.profile")}
                    </Button>
                  </div>
                </div>

                <Button
                  type="button"
                  icon={<Icon name="trash" size={16} />}
                  variant="danger"
                  onClick={() => setSelectedFriendship(friendship)}
                >
                  {t("actions.delete")}
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {isProfileOpen && profileFriendship && (
        <Modal
          title={t("profile.title")}
          icon="user"
          onClose={() => {
            setIsProfileOpen(false);
            setProfileFriendship(null);
          }}
        >
          <ProfileInfo user={profileFriendship.friend} full />
        </Modal>
      )}

      {selectedFriendship && (
        <FriendRemove
          friendshipId={selectedFriendship.friendshipId}
          username={selectedFriendship.friend.username}
          onCancel={() => setSelectedFriendship(null)}
          onRemoved={handleRemoved}
        />
      )}
    </div>
  );
}

export default FriendList;
