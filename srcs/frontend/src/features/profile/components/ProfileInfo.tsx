import Heading from "@/shared/ui/Heading";
import Text from "@/shared/ui/Text";
import Avatar from "@/shared/ui/Avatar";
import OnlineStatus from "@/shared/ui/OnlineStatus";

import { useAuth } from "../../auth/context/useAuth";
import type { User } from "../../auth/types";
import { getDateLocale } from "@/shared/utils/dateLocale";
import { useTranslation } from "react-i18next";

interface ProfileInfoProps {
  user?: User;
  full?: boolean;
}

function ProfileInfo({ user, full = false }: ProfileInfoProps) {
  const { t } = useTranslation();
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
            {t("profile.createdAt")}
            <span className="text-text">
              {new Date(profileUser.createdAt).toLocaleString(getDateLocale())}
            </span>
          </Text>

          <Text size="sm" tone="secondary">
            {t("profile.updatedAt")}
            <span className="text-text">
              {new Date(profileUser.updatedAt).toLocaleString(getDateLocale())}
            </span>
          </Text>
        </div>
      )}
    </div>
  );
}

export default ProfileInfo;
