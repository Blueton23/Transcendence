import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";

import type { User } from "@/features/auth/types";
import Button from "@/shared/ui/Button";
import Input from "@/shared/ui/Input";
import Text from "@/shared/ui/Text";
import Icon from "@/shared/ui/Icon";
import { useTranslation } from "react-i18next";

import FriendSearchResult from "./FriendSearchResult";
import { useFriendSuggestions } from "../hooks/useFriendSuggestions";

interface FriendSearchInputProps {
  query: string;
  selectedUser: User | null;
  onQueryChange: (value: string) => void;
  onSelect: (user: User) => void;
}

function FriendSearchInput({
  query,
  selectedUser,
  onQueryChange,
  onSelect,
}: FriendSearchInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  const { travelers, isSearching, error } = useFriendSuggestions(
    query,
    !selectedUser,
  );

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsOpen(true);
  }

  function handleSelect(user: User) {
    onSelect(user);
    setIsOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <Input
            icon={<Icon name="search" size={18} className="text-muted" />}
            value={query}
            onChange={(event) => {
              onQueryChange(event.target.value);
              setIsOpen(true);
            }}
            onFocus={() => {
              if (query.trim().length >= 2 && !selectedUser) {
                setIsOpen(true);
              }
            }}
            placeholder={t("friendship.searchPlaceholder")}
            className="w-full"
          />
        </div>

        <Button type="submit" variant="dark" disabled={isSearching}>
          {isSearching ? t("friendship.searching") : t("friendship.search")}
        </Button>
      </form>

      {isOpen && !selectedUser && query.trim().length >= 2 && (
        <div className="absolute top-full right-0 left-0 z-50 mt-2 max-h-80 overflow-y-auto rounded-lg border border-border bg-surface shadow-lg">
          {isSearching && (
            <div className="p-4">
              <Text size="sm" tone="secondary">
                {t("actions.searching")}
              </Text>
            </div>
          )}

          {!isSearching && error && (
            <div className="p-4">
              <Text tone="accent">{t("friendship.errors.searchFailed")}</Text>
            </div>
          )}

          {!isSearching && !error && travelers.length === 0 && (
            <div className="p-4">
              <Text size="sm" tone="secondary">
                {t("friendship.noUsersFound")}
              </Text>
            </div>
          )}

          {!isSearching &&
            !error &&
            travelers.map((user) => (
              <FriendSearchResult
                key={user.id}
                user={user}
                onSelect={handleSelect}
              />
            ))}
        </div>
      )}
    </div>
  );
}

export default FriendSearchInput;
