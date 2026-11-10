import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import type { FriendshipRequest } from "@/features/friendship/types";
import type {
  InvitationNotification,
  TravelNotification,
} from "@/features/travel/types";
import Avatar from "@/shared/ui/Avatar";
import Card from "@/shared/ui/Card";
import Heading from "@/shared/ui/Heading";
import Icon from "@/shared/ui/Icon";
import IconBadge from "@/shared/ui/IconBadge";
import Tag from "@/shared/ui/Tag";
import Text from "@/shared/ui/Text";

interface NotificationsCardProps {
  travels: TravelNotification[];
  travelsError?: string | null;
  friendRequests: FriendshipRequest[];
  invitations: InvitationNotification[];
  invitationsError?: string | null;
}

// Same look as the friend requests rows on the profile page.
const rowStyle =
  "flex items-center gap-3 rounded-md border border-border bg-surface p-3";
// Same hover as the interactive Card.
const clickableStyle =
  "cursor-pointer transition-all hover:-translate-y-px hover:border-brand-primary/50";
const tagButtonStyle =
  "cursor-pointer rounded-full transition-opacity hover:opacity-80";

export function NotificationsCard({
  travels,
  travelsError,
  friendRequests,
  invitations,
  invitationsError,
}: NotificationsCardProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isEmpty =
    !travelsError &&
    !invitationsError &&
    travels.length === 0 &&
    friendRequests.length === 0 &&
    invitations.length === 0;

  return (
    <Card variant="default" className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <IconBadge name="bell" size="sm" color="brand" />
        <Heading size="sm">{t("notifications.title")}</Heading>
      </div>

      {isEmpty ? (
        <Text tone="muted">{t("notifications.allCaughtUp")}</Text>
      ) : (
        <div className="flex flex-col gap-2">
          {travelsError && <Text tone="accent">{travelsError}</Text>}
          {travels.map((n) => (
            <div key={n.travelId} className={`${rowStyle} flex-wrap`}>
              <IconBadge name="van" size="sm" />
              <Text className="min-w-0 flex-1 truncate font-semibold">
                {n.travelTitle}
              </Text>
              <div className="flex flex-wrap gap-2">
                {n.unreadMessages > 0 && (
                  <button
                    type="button"
                    className={tagButtonStyle}
                    onClick={() => navigate(`/travel/${n.travelId}/chat`)}
                  >
                    <Tag icon={<Icon name="chat" size={14} />}>
                      {t("notifications.messages", {
                        count: n.unreadMessages,
                      })}
                    </Tag>
                  </button>
                )}
                {n.unseenIdeas > 0 && (
                  <button
                    type="button"
                    className={tagButtonStyle}
                    onClick={() => navigate(`/travel/${n.travelId}/ideas`)}
                  >
                    <Tag icon={<Icon name="bulb" size={14} />}>
                      {t("notifications.ideas", { count: n.unseenIdeas })}
                    </Tag>
                  </button>
                )}
              </div>
            </div>
          ))}

          {friendRequests.map((request) => (
            <button
              key={`friend-${request.id}`}
              type="button"
              className={`${rowStyle} ${clickableStyle} w-full text-left`}
              onClick={() => navigate("/profile")}
            >
              <Avatar user={request.traveler} size="sm" />
              <Text className="min-w-0 flex-1 truncate">
                {t("notifications.friendRequest", {
                  name: request.traveler.username,
                })}
              </Text>
              <Icon name="chev-right" size={18} className="text-muted" />
            </button>
          ))}
          {invitations.map((invitation) => (
            <button
              key={`invitation-${invitation.travelId}`}
              type="button"
              className={`${rowStyle} ${clickableStyle} w-full text-left`}
              onClick={() => navigate(`/join/${invitation.inviteToken}`)}
            >
              <IconBadge name="email" size="sm" color="purple" />
              <Text className="min-w-0 flex-1 truncate">
                {t("notifications.invitation", {
                  title: invitation.travelTitle,
                })}
              </Text>
              <Icon name="chev-right" size={18} className="text-muted" />
            </button>
          ))}
        </div>
      )}
    </Card>
  );
}
