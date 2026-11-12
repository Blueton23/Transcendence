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
import IconBadge from "@/shared/ui/IconBadge";
import Text from "@/shared/ui/Text";
import { getTravelBandColor } from "@/features/travel/utils/getTravelBandColor";
import Dot from "@/shared/ui/Dot";

interface NotificationsCardProps {
  travels: TravelNotification[];
  travelsError?: string | null;
  friendRequests: FriendshipRequest[];
  invitations: InvitationNotification[];
  invitationsError?: string | null;
}

// Compact row, the whole line is clickable.
const rowStyle =
  "flex w-full items-center gap-2.5 rounded-sm px-2 py-2 text-left transition-colors hover:bg-surface-container";
// Same hover as the interactive Card.

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
          {travels.map((n) => {
            const details = [
              n.unreadMessages > 0 &&
                t("notifications.messages", { count: n.unreadMessages }),
              n.unseenIdeas > 0 &&
                t("notifications.ideas", { count: n.unseenIdeas }),
            ]
              .filter(Boolean)
              .join(", ");
            const target = n.unreadMessages > 0 ? "chat" : "ideas";
            return (
              <button
                key={n.travelId}
                type="button"
                className={rowStyle}
                onClick={() => navigate(`/travel/${n.travelId}/${target}`)}
              >
                <Dot className={getTravelBandColor(n.travelId)} />
                <Text size="sm" className="min-w-0 flex-1 truncate">
                  <span className="font-semibold">{n.travelTitle}</span> ·{" "}
                  {details}
                </Text>
              </button>
            );
          })}
          {friendRequests.map((request) => (
            <button
              key={`friend-${request.id}`}
              type="button"
              className={rowStyle}
              onClick={() => navigate("/profile")}
            >
              <Avatar user={request.traveler} size="xs" />
              <Text size="sm" className="min-w-0 flex-1 truncate">
                {t("notifications.friendRequest", {
                  name: request.traveler.username,
                })}
              </Text>
            </button>
          ))}
          {invitations.map((invitation) => (
            <button
              key={`invitation-${invitation.travelId}`}
              type="button"
              className={rowStyle}
              onClick={() => navigate(`/join/${invitation.inviteToken}`)}
            >
              <Dot className={getTravelBandColor(invitation.travelId)} />
              <Text size="sm" className="min-w-0 flex-1 truncate">
                {t("notifications.invitation", {
                  title: invitation.travelTitle,
                })}
              </Text>
            </button>
          ))}
        </div>
      )}
    </Card>
  );
}
