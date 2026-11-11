
import { useFriends } from "@/features/friendship/hooks/useFriends";
import { addParticipant } from "@/features/travel/api/travelApi";
import type { InvitedTraveler } from "@/features/travel/types";
import { useListKeyboard } from "@/shared/hooks/useListKeyboard";
import Button from "@/shared/ui/Button";
import Input from "@/shared/ui/Input";
import Text from "@/shared/ui/Text";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface AddFriendSearchProps {
  travelId: number;
  invitations?: InvitedTraveler[];
  memberIds?: number[];
}

export function AddFriendSearch({
  travelId,
  invitations = [],
  memberIds = [],
}: AddFriendSearchProps) {
  const { t } = useTranslation();

  const { friendships, error: friendsError } = useFriends();
  const [query, setQuery] = useState("");
  const [addedIds, setAddedIds] = useState<number[]>([]);
  const [addError, setAddError] = useState<string | null>(null);

  const search = query.trim().toLowerCase();
  const matches = search
    ? friendships.filter(
        (f) =>
          !memberIds.includes(f.friend.id) &&
          (f.friend.username.toLowerCase().includes(search) ||
            f.friend.firstName?.toLowerCase().includes(search)),
      )
    : [];

  async function handleAdd(friendId: number) {
    setAddError(null);
    try {
      await addParticipant(travelId, friendId);
      setAddedIds((ids) => [...ids, friendId]);
      setQuery("");
    } catch (err) {
      setAddError(err instanceof Error ? err.message : t("errors.unexpected"));
    }
  }

  const list = useListKeyboard(matches, (f) => {
    const invitation = invitations.find((i) => i.id === f.friend.id);
    if (addedIds.includes(f.friend.id) || invitation) return;
    void handleAdd(f.friend.id);
  });

  return (
    <div className="flex flex-col items-start gap-1">
      <Text>{t("travel.searchFriend")}</Text>
      <Input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setAddError(null);
          list.reset();
        }}
        placeholder={t("travel.searchFriendPlaceholder")}
        onKeyDown={list.handleKeyDown}
      ></Input>
      {friendsError && (
        <div role="alert" className="w-full">
          <Text tone="accent" className="whitespace-pre-line">
            {friendsError}
          </Text>
        </div>
      )}
      {search && !friendsError && (
        <div className="flex w-full flex-col rounded-md bg-surface p-1">
          {matches.length === 0 && (
            <Text tone="muted">{t("travel.noFriendMatch")}</Text>
          )}
          {matches.map((f, index) => {
            const invitation = invitations.find((i) => i.id === f.friend.id);
            const isInvited =
              addedIds.includes(f.friend.id) ||
              invitation?.status === "invited";
            return (
              <div
                key={f.friend.id}
                aria-selected={index === list.activeIndex}
                className={`flex items-center justify-between rounded-sm px-3 py-2 text-sm ${
                  index === list.activeIndex ? "bg-surface-raised" : ""
                }`}
              >
                <Text size="sm" className="font-semibold">
                  {f.friend.username}
                </Text>
                {isInvited ? (
                  <Text tone="success" className="font-bold">
                    {t("travel.added")}
                  </Text>
                ) : invitation?.status === "refused" ? (
                  <Text tone="muted">{t("travel.refusedInvitation")}</Text>
                ) : (
                  <Button
                    size="sm"
                    variant="dark"
                    onClick={() => void handleAdd(f.friend.id)}
                    className="px-3! py-1! md:px-3! md:py-1!"
                  >
                    {t("travel.add")}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}
      {addError && (
        <div role="alert" className="w-full">
          <Text tone="accent" className="whitespace-pre-line">
            {addError}
          </Text>
        </div>
      )}
    </div>
  );
}
