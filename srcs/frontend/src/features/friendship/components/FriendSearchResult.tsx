import type { User } from "@/features/auth/types";

import Avatar from "@/shared/ui/Avatar";
import Icon from "@/shared/ui/Icon";

interface FriendSearchResultProps {
  user: User;
  onSelect: (user: User) => void;
}

function FriendSearchResult({ user, onSelect }: FriendSearchResultProps) {
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ");

  return (
    <button
      type="button"
      onClick={() => onSelect(user)}
      className="flex w-full items-center gap-3 border-b border-border p-3 text-left last:border-b-0 hover:bg-surface-container focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset"
    >
      <Avatar user={user} profile />

      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate font-medium">{user.username}</span>

        {fullName && (
          <span className="truncate text-sm text-muted">{fullName}</span>
        )}
      </div>

      <Icon name="chevron-right" size={18} className="text-muted" />
    </button>
  );
}

export default FriendSearchResult;
