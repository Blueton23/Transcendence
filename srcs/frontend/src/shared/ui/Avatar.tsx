import { useAuth } from "@/features/auth/context/useAuth";

type AvatarSize = "xs" | "sm" | "md" | "lg";
type AvatarColor = "1" | "2" | "3" | "4";

interface AvatarUser {
  profilePicture?: string | null;
  firstName?: string | null;
  lastName?: string | null;
}

interface AvatarProps {
  user?: AvatarUser | null;
  size?: AvatarSize;
  color?: AvatarColor;
  className?: string;
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
}: AvatarProps) {
  const { currentUser } = useAuth();
  const avatarUser = user ?? currentUser;
  const avatarSize = sizeStyles[size];
  const avatarColor = colorStyles[color];
  const initials =
    `${avatarUser?.firstName?.charAt(0) ?? ""}${avatarUser?.lastName?.charAt(0) ?? ""}`.toUpperCase();

  return (
    <span className={`${baseStyle} ${avatarSize} ${avatarColor} ${className}`}>
      {avatarUser?.profilePicture ? (
        <img
          src={avatarUser.profilePicture}
          alt="Photo de profil"
          className="h-full w-full object-cover"
        />
      ) : initials ? (
        initials
      ) : (
        "A"
      )}
    </span>
  );
}

export default Avatar;
