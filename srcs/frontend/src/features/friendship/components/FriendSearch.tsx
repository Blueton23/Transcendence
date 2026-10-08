import { useState } from "react";

import type { User } from "@/features/auth/types";
import { searchFriend, sendFriendRequest } from "../api/friendship";

import Button from "@/shared/ui/Button";
import Heading from "@/shared/ui/Heading";
import Input from "@/shared/ui/Input";
import Text from "@/shared/ui/Text";
import Avatar from "@/shared/ui/Avatar";
import Icon from "@/shared/ui/Icon";

function FriendSearch() {
  const [query, setQuery] = useState("");
  const [traveler, setTraveler] = useState<User | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isSending, setIsSending] = useState(false);

  async function handleSearch() {
    const value = query.trim();

    if (!value) {
      setError("Saisissez un username ou un email.");
      setTraveler(null);
      return;
    }

    setIsSearching(true);
    setError(null);
    setMessage(null);
    setTraveler(null);

    try {
      const response = await searchFriend(value);
      setTraveler(response.traveler);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Utilisateur introuvable.");
    } finally {
      setIsSearching(false);
    }
  }

  async function handleSendRequest() {
    if (!traveler) {
      return;
    }

    setIsSending(true);
    setError(null);
    setMessage(null);

    try {
      await sendFriendRequest(traveler.id);
      setTraveler(null);
      setMessage("Demande d'amitié envoyée.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Impossible d'envoyer la demande.",
      );
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <Heading level={1} size="xl">
          Amis
        </Heading>
      </div>

      <div className="flex gap-3 sm:flex-row">
        <Input
          icon={<Icon name="search" size={18} className="text-muted" />}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Ajouter un ami · pseudo ou email"
          className="flex-1"
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              void handleSearch();
            }
          }}
        />

        <Button
          type="button"
          variant="dark"
          onClick={() => void handleSearch()}
          disabled={isSearching}
        >
          {isSearching ? "Recherche..." : "Rechercher"}
        </Button>
      </div>

      {error && <Text tone="accent">{error}</Text>}

      {message && <Text tone="success">{message}</Text>}

      {traveler && (
        <div className="flex flex-col gap-4 rounded-md border border-border bg-surface-container p-4">
          <div className="flex items-center gap-3">
            <Avatar user={traveler} />
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
            disabled={isSending || !!message}
          >
            {isSending ? "Envoi..." : "Envoyer une demande"}
          </Button>
        </div>
      )}
    </div>
  );
}

export default FriendSearch;
