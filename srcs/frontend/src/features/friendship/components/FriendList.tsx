import { useEffect, useState } from "react";

import type { Friendship } from "../types";
import { getFriends } from "../api/friendship";

import Text from "@/shared/ui/Text";
import Avatar from "@/shared/ui/Avatar";
import Icon from "@/shared/ui/Icon";

import FriendRemove from "./FriendRemove";
import { useTranslation } from "react-i18next";
import Modal from "@/shared/ui/Modal";
import ProfileInfo from "@/features/profile/components/ProfileInfo";
import IconButton from "@/shared/ui/IconButton";
import { getAvatarColor } from "@/shared/utils/getAvatarColors";
import OnlineDot from "@/shared/ui/OnlineDot";
import { useFriendPresence } from "../hooks/useFriendPresence";
import i18n from "@/i18n";

interface FriendListProps {
  refreshKey: number;
}

function FriendList({ refreshKey }: FriendListProps) {
  const [friendships, setFriendships] = useState<Friendship[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [profileFriendshipId, setProfileFriendshipId] = useState<number | null>(
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

  // Live online status: updates the list when a friend connects or leaves.
  useFriendPresence(setFriendships);

  // Read from the list (not a copy) so the open profile follows live presence.
  const profileFriend = friendships.find(
    (friendship) => friendship.friendshipId === profileFriendshipId,
  )?.friend;

  function handleRemoved(friendshipId: number) {
    setFriendships((current) =>
      current.filter((friendship) => friendship.friendshipId !== friendshipId),
    );

    setSelectedFriendship(null);
  }

  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-1">
        <Text tone="muted" className="font-semibold">
          {t("friendship.myFriends", { count: friendships.length })}
        </Text>
      </div>

      {error && (
        <Text tone="accent" className="whitespace-pre-line">
          {error}
        </Text>
      )}

      {friendships.length === 0 ? (
        <Text tone="muted">{t("friendship.noFriends")}</Text>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {friendships.map((friendship) => {
            const friend = friendship.friend;

            return (
              <div
                key={friendship.friendshipId}
                className="flex items-center justify-between gap-3 rounded-md border border-border bg-surface py-2.5 pr-1 pl-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="relative shrink-0">
                    <Avatar
                      user={friend}
                      color={getAvatarColor([], friend.id)}
                      profile
                    />
                    <OnlineDot isOnline={friend.isOnline} />
                  </span>

                  <div className="flex min-w-0 flex-col">
                    <Text className="truncate font-semibold">
                      {friend.username}
                    </Text>
                    <Text size="sm" className="truncate">
                      {friend.email}
                    </Text>
                  </div>
                </div>

                <div className="flex shrink-0 items-center">
                  <IconButton
                    type="button"
                    size="sm"
                    label={t("nav.profile")}
                    icon={<Icon name="user" size={16} />}
                    variant="ghost"
                    onClick={() =>
                      setProfileFriendshipId(friendship.friendshipId)
                    }
                  />
                  <IconButton
                    type="button"
                    label={t("actions.delete")}
                    size="sm"
                    icon={<Icon name="trash" size={16} />}
                    variant="ghost"
                    onClick={() => setSelectedFriendship(friendship)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {profileFriend && (
        <Modal
          title={t("profile.title")}
          icon="user"
          onClose={() => setProfileFriendshipId(null)}
        >
          <ProfileInfo user={profileFriend} />
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
