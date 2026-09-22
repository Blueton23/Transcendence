import { computeTravelDates } from "@/features/travel/utils/computeTravelDates";
import type { Travel } from "@/features/travel/types";
import Heading from "@/shared/ui/Heading";
import Tag from "@/shared/ui/Tag";
import Icon from "@/shared/ui/Icon";
import IconButton from "@/shared/ui/IconButton";
import { useState } from "react";
import DropdownMenu from "@/shared/ui/DropdownMenu";
import MenuItem from "@/shared/ui/MenuItem";
import Divider from "@/shared/ui/Divider";
import { useSubmitAction } from "@/shared/hooks/useSubmitAction";
import { leaveTravel } from "@/features/travel/api/travelApi";
import { useNavigate } from "react-router";

interface TravelHeaderProps {
  travel: Travel;
  totalKms: number;
}

function TravelOptionsButton({ travelId }: { travelId: number }) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const { submit, isSubmitting, error } = useSubmitAction(() =>
    leaveTravel(travelId),
  );

  const handleOnSubmit = async () => {
    const result = await submit();
    if (result.success) navigate("/trip");
  };

  if (error) return <p>{error}</p>;

  return (
    <div
      className="absolute top-4 right-4"
      onClick={(e) => e.stopPropagation()}
    >
      <IconButton
        icon={<Icon name="dots" size={16} />}
        label="Options"
        className="border-white/16! bg-white/12! text-inverse!"
        onClick={() => setIsOpen((v) => !v)}
        onMouseDown={(e) => e.stopPropagation()}
      />
      {isOpen && (
        <DropdownMenu
          onClose={() => setIsOpen(false)}
          className="top-full right-0 mt-2"
        >
          <MenuItem icon="edit">Créer le lien d'invitation</MenuItem>
          <MenuItem icon="users">Gérer les voyageurs</MenuItem>
          <MenuItem icon="cal">Changer les dates</MenuItem>
          <Divider />
          <MenuItem
            onClick={handleOnSubmit}
            disabled={isSubmitting}
            icon="arrow"
            tone="danger"
          >
            Quitter le voyage
          </MenuItem>
        </DropdownMenu>
      )}
    </div>
  );
}

export function TravelHeader({ travel, totalKms }: TravelHeaderProps) {
  const DatesLabel = computeTravelDates(travel.startDate, travel.endDate);
  return (
    <div className="relative flex flex-col gap-5 rounded-md bg-linear-to-br from-[#3A3760] via-[#2B2A47] to-[#211F3A] px-3.5 py-5 md:gap-3 md:p-6">
      <Heading level={1} size="lg" className="text-inverse!">
        {travel.title}
      </Heading>
      <div className="flex flex-nowrap gap-2">
        <Tag tone="inverse" className="border-error/80! bg-error/30!">
          {DatesLabel}
        </Tag>
        <Tag
          icon={<Icon name="moon" size={14} />}
          tone="inverse"
        >{`${travel.nights} nuits`}</Tag>
        <Tag
          icon={<Icon name="car" size={14} />}
          tone="inverse"
        >{`${totalKms} kms`}</Tag>
      </div>
      <TravelOptionsButton travelId={travel.id} />
    </div>
  );
}
