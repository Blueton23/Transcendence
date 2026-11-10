import { useFriends } from "@/features/friendship/hooks/useFriends";
import { addParticipant } from "@/features/travel/api/travelApi";
import type { InvitedTraveler } from "@/features/travel/types";
import Button from "@/shared/ui/Button";
import Card from "@/shared/ui/Card";
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

  return (
    <div className="flex flex-col items-start gap-1">
      <Text>{t("travel.searchFriend")}</Text>
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t("travel.searchFriendPlaceholder")}
      ></Input>
      {search && (
        <Card className="flex w-full flex-col gap-2">
          {friendsError ? (
            <Text tone="accent">{friendsError}</Text>
          ) : (
            matches.length === 0 && (
              <Text tone="muted">{t("travel.noFriendMatch")}</Text>
            )
          )}
          {matches.map((f) => {
            const invitation = invitations.find((i) => i.id === f.friend.id);
            const isInvited =
              addedIds.includes(f.friend.id) ||
              invitation?.status === "invited";
            return (
              <div
                key={f.friend.id}
                className="flex items-center justify-between"
              >
                <Text tone="primary" className="font-bold">
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
                    className="md:px-4! md:py-1.5!"
                  >
                    {t("travel.add")}
                  </Button>
                )}
              </div>
            );
          })}
          {addError && <Text tone="accent">{addError}</Text>}
        </Card>
      )}
    </div>
  );
}
