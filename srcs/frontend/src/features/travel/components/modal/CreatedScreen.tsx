import { useFriends } from "@/features/friendship/hooks/useFriends";
import { addParticipant } from "@/features/travel/api/travelApi";
import type { Travel } from "@/features/travel/types";
import Button from "@/shared/ui/Button";
import Card from "@/shared/ui/Card";
import Input from "@/shared/ui/Input";
import Text from "@/shared/ui/Text";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface CreatedScreenProps {
  travel: Travel;
  onClose: () => void;
}

export function CreatedScreen({ travel, onClose }: CreatedScreenProps) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);
  const { t } = useTranslation();

  const handleCopy = async () => {
    setCopyError(null);
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopyError(t("travel.errors.copyFailed"));
    }
  };

  const { friendships, error: friendsError } = useFriends();
  const [query, setQuery] = useState("");
  const [addedIds, setAddedIds] = useState<number[]>([]);
  const [addError, setAddError] = useState<string | null>(null);

  const search = query.trim().toLowerCase();
  const matches = search
    ? friendships.filter((f) =>
        f.friend.username.toLowerCase().includes(search),
      )
    : [];

  async function handleAdd(friendId: number) {
    setAddError(null);
    try {
      await addParticipant(travel.id, friendId);
      setAddedIds((ids) => [...ids, friendId]);
    } catch (err) {
      setAddError(err instanceof Error ? err.message : t("errors.unexpected"));
    }
  }

  const link = `${window.location.origin}/join/${travel.inviteToken}`;
  return (
    <div className="flex flex-col gap-3">
      <Text font="mono" tone="muted">
        {" "}
        {t("travel.inviteTravelers")} {travel.title}
      </Text>
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
            {matches.map((f) => (
              <div
                key={f.friend.id}
                className="flex items-center justify-between"
              >
                <Text tone="primary" className="font-bold">
                  {f.friend.username}
                </Text>
                {addedIds.includes(f.friend.id) ? (
                  <Text tone="success" className="font-bold">
                    {t("travel.added")}
                  </Text>
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
            ))}
            {addError && <Text tone="accent">{addError}</Text>}
          </Card>
        )}
      </div>
      <div className="flex flex-col items-start gap-1">
        <Text>{t("travel.inviteLink")}</Text>
        <Card className="flex w-full items-center justify-between bg-surface-control p-2! pl-4!">
          {copyError && <Text tone="accent">{copyError}</Text>}
          <Text font="mono">{link}</Text>
          <Button
            size="sm"
            variant="dark"
            onClick={handleCopy}
            className="md:px-4! md:py-1.5!"
          >
            {copied ? t("travel.copied") : t("travel.copy")}
          </Button>
        </Card>
      </div>

      <Button variant="ghost" className="w-full underline" onClick={onClose}>
        {t("travel.skipForNow")}
      </Button>
    </div>
  );
}
