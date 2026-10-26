import { useState } from "react";
import type { User } from "@/features/auth/types";

import { sendFriendRequest } from "../api/friendship";
import { useSubmitAction } from "@/shared/hooks/useSubmitAction";

import Button from "@/shared/ui/Button";
import Heading from "@/shared/ui/Heading";
import Text from "@/shared/ui/Text";
import Avatar from "@/shared/ui/Avatar";
import FriendSearchInput from "./FriendSearchInput";
import { useTranslation } from "react-i18next";

function FriendSearch() {
  const [query, setQuery] = useState("");
  const [traveler, setTraveler] = useState<User | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const { t } = useTranslation();

  const {
    submit: submitRequest,
    isSubmitting: isSending,
    error: requestError,
    clearError: clearRequestError,
  } = useSubmitAction(async () => {
    if (!traveler) {
      throw new Error(t("friendship.errors.noUserSelected"));
    }

    return sendFriendRequest(traveler.id);
  });

  function handleSelect(user: User) {
    setTraveler(user);
    setQuery(user.username);
    setMessage(null);
    clearRequestError();
  }

  function handleChange(value: string) {
    setQuery(value);
    setTraveler(null);
    setMessage(null);
    clearRequestError();
  }

  async function handleSendRequest() {
    if (!traveler) return;

    setMessage(null);

    const result = await submitRequest();

    if (result.success) {
      setTraveler(null);
      setQuery("");
      setMessage(t("friendship.requestSent"));
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <Heading level={1} size="lg">
        {t("friendship.title")}
      </Heading>

      <FriendSearchInput
        query={query}
        selectedUser={traveler}
        onQueryChange={handleChange}
        onSelect={handleSelect}
      />

      {requestError && <Text tone="accent">{requestError}</Text>}

      {message && <Text tone="success">{message}</Text>}

      {traveler && (
        <div className="flex flex-col gap-4 rounded-md border border-border bg-surface-container p-4">
          <div className="flex items-center gap-3">
            <Avatar user={traveler} profile />

            <div className="flex min-w-0 flex-1 flex-col">
              <Text>{traveler.username}</Text>

              {(traveler.first_name || traveler.last_name) && (
                <Text size="sm" tone="secondary">
                  {[traveler.first_name, traveler.last_name]
                    .filter(Boolean)
                    .join(" ")}
                </Text>
              )}
            </div>

            <Button
              type="button"
              variant="dark"
              onClick={() => handleChange("")}
            >
              {t("actions.cancel")}
            </Button>
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
