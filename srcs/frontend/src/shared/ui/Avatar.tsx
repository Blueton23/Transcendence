import { useState } from "react";

import { useAuth } from "@/features/auth/context/useAuth";
import ProfileInfo from "@/features/profile/components/ProfileInfo";
import Modal from "@/shared/ui/Modal";
import type { ReactNode } from "react";
import type { User } from "@/features/auth/types";

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";
type AvatarColor = "1" | "2" | "3" | "4";

interface AvatarProps {
  user?: User | null;
  size?: AvatarSize;
  color?: AvatarColor;
  className?: string;
  profile?: boolean;
  children?: ReactNode;
}

const sizeStyles = {
  xs: "w-4 h-4 text-2xs",
  sm: "w-7 h-7 text-xs",
  md: "w-8 h-8 text-sm",
  lg: "w-9 h-9 text-md",
  xl: "w-15 h-15 text-lg",
};

const colorStyles = {
  "1": "bg-brand-dark text-inverse",
  "2": "bg-brand-primary-strong text-inverse",
  "3": "bg-warning text-text",
  "4": "bg-info text-inverse",
};

const baseStyle =
  "inline-flex items-center justify-center overflow-hidden rounded-full font-bold";

function Avatar({
  user,
  size = "md",
  color = "1",
  className = "",
  profile = false,
  children,
}: AvatarProps) {
  const { currentUser } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const avatarUser = user ?? currentUser;
  const avatarSize = sizeStyles[size];
  const avatarColor = colorStyles[color];

  const initials =
    `${avatarUser?.firstName?.charAt(0) ?? ""}${avatarUser?.lastName?.charAt(0) ?? ""}`.toUpperCase();

  const avatarContent = (
    <>
      {avatarUser?.profilePicture ? (
        <img
          src={avatarUser.profilePicture}
          alt="Photo de profil"
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
          aria-label="Voir le profil"
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
          title="Profil"
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
