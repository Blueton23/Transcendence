import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import type { TravelNotification } from "@/features/travel/types";
import Card from "@/shared/ui/Card";
import Heading from "@/shared/ui/Heading";
import Icon from "@/shared/ui/Icon";
import Tag from "@/shared/ui/Tag";
import Text from "@/shared/ui/Text";

interface TravelNotificationsCardProps {
  notifications: TravelNotification[];
}

export function TravelNotificationsCard({
  notifications,
}: TravelNotificationsCardProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Card variant="default" className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Icon name="bell" />
        <Heading size="sm">{t("notifications.title")}</Heading>
      </div>

      {notifications.length === 0 ? (
        <Text tone="muted">{t("notifications.allCaughtUp")}</Text>
      ) : (
        notifications.map((n) => (
          <div key={n.travelId} className="flex flex-wrap items-center gap-2">
            <Text className="font-semibold">{n.travelTitle}</Text>
            {n.unreadMessages > 0 && (
              <button
                className="cursor-pointer"
                onClick={() => navigate(`/travel/${n.travelId}/chat`)}
              >
                <Tag icon={<Icon name="chat" size={14} />}>
                  {t("notifications.messages", { count: n.unreadMessages })}
                </Tag>
              </button>
            )}
            {n.unseenIdeas > 0 && (
              <button
                className="cursor-pointer"
                onClick={() => navigate(`/travel/${n.travelId}/ideas`)}
              >
                <Tag icon={<Icon name="pinplus" size={14} />}>
                  {t("notifications.ideas", { count: n.unseenIdeas })}
                </Tag>
              </button>
            )}
          </div>
        ))
      )}
    </Card>
  );
}
