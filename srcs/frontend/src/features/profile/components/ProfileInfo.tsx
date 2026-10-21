import Heading from "@/shared/ui/Heading";
import Text from "@/shared/ui/Text";
import Avatar from "@/shared/ui/Avatar";
import OnlineStatus from "@/shared/ui/OnlineStatus";

import { useAuth } from "@/features/auth/context/useAuth";
import type { User } from "@/features/auth/types";

interface ProfileInfoProps {
  user?: User;
  full?: boolean;
}

function ProfileInfo({ user, full = false }: ProfileInfoProps) {
  const { currentUser } = useAuth();
  const profileUser = user ?? currentUser;

  if (!profileUser) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <div className="flex w-25 justify-center">
          <Avatar user={profileUser} size="xl" />
        </div>

        <div className="min-w-0">
          <Heading level={3} size="lg">
            {profileUser.firstName} {profileUser.lastName}
          </Heading>

          <Text tone="secondary" size="md" font="mono">
            {profileUser.username}
          </Text>

          <Text tone="primary" size="md">
            {profileUser.email}
          </Text>
        </div>
      </div>

      {full && (
        <div className="flex flex-col gap-2 border-t border-border pt-4">
          <div className="mt-2">
            <OnlineStatus isOnline={profileUser.isOnline} />
          </div>
          <Text size="sm" tone="secondary">
            Compte créé le :{" "}
            <span className="text-text">
              {new Date(profileUser.createdAt).toLocaleString("fr-FR")}
            </span>
          </Text>

          <Text size="sm" tone="secondary">
            Dernière mise à jour :{" "}
            <span className="text-text">
              {new Date(profileUser.updatedAt).toLocaleString("fr-FR")}
            </span>
          </Text>
        </div>
      )}
    </div>
  );
}

export default ProfileInfo;
