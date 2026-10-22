import { useState } from "react";
import type { FormEvent } from "react";

import type { User } from "@/features/auth/types";
import { searchFriend, sendFriendRequest } from "../api/friendship";
import { useSubmitAction } from "@/shared/hooks/useSubmitAction";

import Button from "@/shared/ui/Button";
import Heading from "@/shared/ui/Heading";
import Input from "@/shared/ui/Input";
import Text from "@/shared/ui/Text";
import Avatar from "@/shared/ui/Avatar";
import Icon from "@/shared/ui/Icon";
import { useTranslation } from "react-i18next";

function FriendSearch() {
  const [query, setQuery] = useState("");
  const [traveler, setTraveler] = useState<User | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const { t } = useTranslation();

  const {
    submit: submitSearch,
    isSubmitting: isSearching,
    error: searchError,
  } = useSubmitAction(async () => {
    const value = query.trim();
    return searchFriend(value);
  });

  const {
    submit: submitRequest,
    isSubmitting: isSending,
    error: requestError,
    clearError: ClearRequestError,
  } = useSubmitAction(async () => {
    if (!traveler) {
      throw new Error(t("friendship.errors.noUserSelected"));
    }
    return sendFriendRequest(traveler.id);
  });

  async function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setTraveler(null);
    setMessage(null);
    ClearRequestError();

    const result = await submitSearch();

    if (result.success && result.data) {
      setTraveler(result.data.traveler);
    }
  }

  async function handleSendRequest() {
    setMessage(null);

    const result = await submitRequest();

    if (result.success) {
      setTraveler(null);
      setMessage(t("friendship.requestSent"));
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <Heading level={1} size="lg">
          {t("friendship.title")}
        </Heading>
      </div>
      <form
        onSubmit={handleSearchSubmit}
        className="flex flex-col gap-3 sm:flex-row"
      >
        <Input
          icon={<Icon name="search" size={18} className="text-muted" />}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setMessage(null);
          }}
          placeholder={t("friendship.searchPlaceholder")}
          className="flex-1"
        />

        <Button type="submit" variant="dark" disabled={isSearching}>
          {isSearching ? t("actions.searching") : t("friendship.search")}
        </Button>
      </form>
      {searchError && <Text tone="accent">{searchError}</Text>}
      {requestError && <Text tone="accent">{requestError}</Text>}
      {message && <Text tone="success">{message}</Text>}
      {traveler && (
        <div className="flex flex-col gap-4 rounded-md border border-border bg-surface-container p-4">
          <div className="flex items-center gap-3">
            <Avatar user={traveler} profile />

            <div className="flex min-w-0 flex-col">
              <Text>{traveler.username}</Text>

              <Text size="sm" tone="secondary">
                {traveler.email}
              </Text>
            </div>
          </div>

          <Button
            type="button"
            variant="primary"
            onClick={() => void handleSendRequest()}
            disabled={isSending}
          >
            {isSending ? t("friendship.sending") : t("friendship.sendRequest")}
          </Button>
        </div>
      )}
    </div>
  );
}

export default FriendSearch;
