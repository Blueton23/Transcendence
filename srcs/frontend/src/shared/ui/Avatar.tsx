import { useState } from "react";

import { useAuth } from "@/features/auth/context/useAuth";
import ProfileInfo from "@/features/profile/components/ProfileInfo";
import Modal from "@/shared/ui/Modal";
import type { ReactNode } from "react";
import type { User } from "@/features/auth/types";
import { useTranslation } from "react-i18next";

type AvatarSize = "xs" | "sm" | "md" | "lg";
export type AvatarColor = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "pending";

interface AvatarProps {
  user?: User | null;
  size?: AvatarSize;
  color?: AvatarColor;
  className?: string;
  profile?: boolean;
  children?: ReactNode;
}

// xs: inline next to a name (idea author, notification)
// sm: compact rows and stacks (balances, settlements, travelers stack)
// md: lists and account (chat, friends, top bar, sidebar)
// lg: profile
const sizeStyles = {
  xs: "size-5 shrink-0 text-2xs",
  sm: "size-7 shrink-0 text-xs",
  md: "size-9 shrink-0 text-xs",
  lg: "size-15 shrink-0 text-lg",
};

const colorStyles = {
  "1": "bg-avatar-1",
  "2": "bg-avatar-2",
  "3": "bg-avatar-3",
  "4": "bg-avatar-4",
  "5": "bg-avatar-5",
  "6": "bg-avatar-6",
  "7": "bg-avatar-7",
  pending:
    "bg-surface-container text-muted! border border-dashed border-text/30",
};

const baseStyle =
  "inline-flex items-center justify-center overflow-hidden rounded-full font-bold text-inverse";

function Avatar({
  user,
  size = "md",
  color = "7",
  className = "",
  profile = false,
  children,
}: AvatarProps) {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const avatarUser = user ?? (children ? null : currentUser);
  const avatarSize = sizeStyles[size];
  const avatarColor = colorStyles[color];

  const initials =
    `${avatarUser?.firstName?.charAt(0) ?? ""}${avatarUser?.lastName?.charAt(0) ?? ""}`.toUpperCase();

  const avatarContent = (
    <>
      {avatarUser?.profilePicture ? (
        <img
          src={avatarUser.profilePicture}
          alt={t("profile.picture")}
          className="h-full w-full object-cover"
        />
      ) : initials ? (
        initials
      ) : children ? (
        children
      ) : (
        "A"
      )}
    </>
  );

  return (
    <>
      {profile ? (
        <button
          type="button"
          onClick={() => setIsProfileOpen(true)}
          aria-label={t("profile.view")}
          className={`${baseStyle} ${avatarSize} ${avatarColor} ${className} cursor-pointer`}
        >
          {avatarContent}
        </button>
      ) : (
        <span
          className={`${baseStyle} ${avatarSize} ${avatarColor} ${className}`}
        >
          {avatarContent}
        </span>
      )}

      {profile && isProfileOpen && (
        <Modal
          title={t("profile.title")}
          icon="user"
          onClose={() => setIsProfileOpen(false)}
        >
          <ProfileInfo user={user ?? undefined} full />
        </Modal>
      )}
    </>
  );
}

export default Avatar;
