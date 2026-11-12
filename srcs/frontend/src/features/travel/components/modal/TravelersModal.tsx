import { AddFriendSearch } from "@/features/travel/components/AddFriendSearch";
import type { Travel } from "@/features/travel/types";
import Avatar from "@/shared/ui/Avatar";
import Modal from "@/shared/ui/Modal";
import Tag from "@/shared/ui/Tag";
import Text from "@/shared/ui/Text";
import { getAvatarColor } from "@/shared/utils/getAvatarColors";
import { useTranslation } from "react-i18next";

interface TravelersModalProps {
  travel: Travel;
  onClose: () => void;
}

export function TravelersModal({ travel, onClose }: TravelersModalProps) {
  const { t } = useTranslation();
  const memberIds = travel.travelers.map((traveler) => traveler.id);

  return (
    <Modal icon="users" title={t("travel.manageTravelers")} onClose={onClose}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          {travel.travelers.map((traveler) => (
            <div key={traveler.id} className="flex items-center gap-3">
              <Avatar color={getAvatarColor(travel.travelers, traveler.id)}>
                {traveler.initials}
              </Avatar>
              <Text>{traveler.name}</Text>
            </div>
          ))}
          {travel.invitations
            .filter((invitation) => invitation.status == "invited")
            .map((invitation) => (
              <div key={invitation.id} className="flex items-center gap-3">
                <Avatar color="pending">{invitation.initials}</Avatar>
                <Text tone="muted" className="flex-1">
                  {invitation.name}
                </Text>
                <Tag tone="muted">{t("travel.pendingInvitation")}</Tag>
              </div>
            ))}
        </div>
        <AddFriendSearch
          travelId={travel.id}
          invitations={travel.invitations}
          memberIds={memberIds}
        />
      </div>
    </Modal>
  );
}
