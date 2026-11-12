import Heading from "@/shared/ui/Heading";
import Text from "@/shared/ui/Text";
import Avatar from "@/shared/ui/Avatar";
import OnlineStatus from "@/shared/ui/OnlineStatus";
import { useAuth } from "@/features/auth/context/useAuth";
import type { User } from "@/features/auth/types";
import { getDateLocale } from "@/shared/utils/dateLocale";
import { useTranslation } from "react-i18next";
import Card from "@/shared/ui/Card";

function ProfileInfo({ user }: { user?: User }) {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const profileUser = user ?? currentUser;

  if (!profileUser) {
    return null;
  }

  const formatDay = (date: string) =>
    new Date(date).toLocaleDateString(getDateLocale(), {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return (
    <Card
      band={<span aria-hidden="true" />}
      bandClassName="h-14 bg-band-1"
      className="flex flex-col gap-3"
    >
      <div className="-mt-10 flex items-end justify-between">
        <Avatar user={profileUser} size="lg" className="ring-3 ring-surface" />
        <OnlineStatus isOnline={profileUser.isOnline} />
      </div>

      <div className="flex min-w-0 flex-col gap-0.5">
        <Heading level={2} size="md">
          {profileUser.firstName} {profileUser.lastName}
        </Heading>

        <Text tone="secondary" size="sm" font="mono">
          @{profileUser.username}
        </Text>

        <Text>{profileUser.email}</Text>
      </div>

      <div className="flex flex-col gap-1 border-t border-border pt-3">
        <Text size="sm" tone="secondary">
          {t("profile.createdAt")}{" "}
          <span className="text-text">{formatDay(profileUser.createdAt)}</span>
        </Text>

        <Text size="sm" tone="secondary">
          {t("profile.updatedAt")}{" "}
          <span className="text-text">{formatDay(profileUser.updatedAt)}</span>
        </Text>
      </div>
    </Card>
  );
}

export default ProfileInfo;
