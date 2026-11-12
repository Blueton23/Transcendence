import { leaveTravel } from "@/features/travel/api/travelApi";
import { TravelEditModal } from "@/features/travel/components/modal/TravelEditModal";
import { TravelersModal } from "@/features/travel/components/modal/TravelersModal";
import type { Travel } from "@/features/travel/types";
import { useSubmitAction } from "@/shared/hooks/useSubmitAction";
import Divider from "@/shared/ui/Divider";
import DropdownMenu from "@/shared/ui/DropdownMenu";
import Icon from "@/shared/ui/Icon";
import IconButton from "@/shared/ui/IconButton";
import MenuItem from "@/shared/ui/MenuItem";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

interface TravelOptionsButtonProps {
  travel: Travel;
  variant?: "dark" | "light";
  onLeave?: () => void;
}

const buttonStyles = {
  dark: "border-white/16! bg-white/12! text-inverse!",
  light: "border-transparent! bg-surface-control/40! text-text!",
};

export function TravelOptionsButton({
  travel,
  variant = "dark",
  onLeave,
}: TravelOptionsButtonProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isManageOpen, setIsManageOpen] = useState(false);
  const { submit, isSubmitting, error } = useSubmitAction(() =>
    leaveTravel(travel.id),
  );

  const handleOnSubmit = async () => {
    const result = await submit();
    if (!result.success) return;
    if (onLeave) onLeave();
    else navigate("/travel");
  };

  if (error) return <p>{error}</p>;

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <IconButton
        icon={<Icon name="dots" size={16} />}
        label={t("actions.options")}
        className={buttonStyles[variant]}
        onClick={() => setIsOpen((v) => !v)}
        onMouseDown={(e) => e.stopPropagation()}
      />
      {isOpen && (
        <DropdownMenu
          onClose={() => setIsOpen(false)}
          className="top-full right-0 mt-2"
        >
          <MenuItem
            icon="edit"
            onClick={async () => {
              const link = `${window.location.origin}/join/${travel.inviteToken}`;
              await navigator.clipboard.writeText(link);
              setIsOpen(false);
            }}
          >
            {t("travel.copyInviteLink")}
          </MenuItem>
          <MenuItem
            icon="users"
            onClick={() => {
              setIsOpen(false);
              setIsManageOpen(true);
            }}
          >
            {t("travel.manageTravelers")}
          </MenuItem>
          <MenuItem
            onClick={() => {
              setIsOpen(false);
              setIsEditOpen(true);
            }}
            icon="cal"
          >
            {t("travel.editTravel")}
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={handleOnSubmit}
            disabled={isSubmitting}
            icon="arrow"
            tone="danger"
          >
            {t("travel.leave")}
          </MenuItem>
        </DropdownMenu>
      )}
      {isEditOpen && (
        <TravelEditModal travel={travel} onClose={() => setIsEditOpen(false)} />
      )}
      {isManageOpen && (
        <TravelersModal
          travel={travel}
          onClose={() => setIsManageOpen(false)}
        />
      )}
    </div>
  );
}
