import type { Step } from "@/features/step/types";
import { computeDates, computeNights } from "@/features/travel/travelDates";
import type { Travel } from "@/features/travel/types";
import Heading from "@/shared/ui/Heading";
import Tag from "@/shared/ui/Tag";
import Text from "@/shared/ui/Text";
import Icon from "@/shared/ui/Icon";
import IconButton from "@/shared/ui/IconButton";
import { useState } from "react";
import DropdownMenu from "@/shared/ui/DropdownMenu";
import MenuItem from "@/shared/ui/MenuItem";
import Divider from "@/shared/ui/Divider";

interface TravelHeaderProps {
  travel: Travel;
  firstStep: Step;
  lastStep: Step;
  totalKms: number;
}

function TravelOptionsButton() {
  const [isOpen, setIsOpen] = useState(false);
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
          <MenuItem icon="arrow" tone="danger">
            Quitter le voyage
          </MenuItem>
        </DropdownMenu>
      )}
    </div>
  );
}

export function TravelHeader({
  travel,
  firstStep,
  lastStep,
  totalKms,
}: TravelHeaderProps) {
  const NbNights = computeNights(travel.startDate, travel.endDate);
  const DatesLabel = computeDates(travel.startDate, travel.endDate);
  return (
    <div className="relative flex flex-col gap-3 rounded-md bg-linear-to-br from-[#3A3760] via-[#2B2A47] to-[#211F3A] p-6">
      <Text
        font="mono"
        tone="secondary"
        size="sm"
        className="text-inverse! uppercase"
      >{`${firstStep.localisation} → ${lastStep.localisation}`}</Text>
      <Heading level={1} size="lg" className="text-inverse!">
        {travel.title}
      </Heading>
      <div className="flex flex-wrap gap-2">
        <Tag tone="inverse" className="border-error/80! bg-error/30!">
          {DatesLabel}
        </Tag>
        <Tag
          icon={<Icon name="moon" size={14} />}
          tone="inverse"
        >{`${NbNights} nuits`}</Tag>
        <Tag
          icon={<Icon name="car" size={14} />}
          tone="inverse"
        >{`${totalKms} kms`}</Tag>
      </div>
      <TravelOptionsButton />
    </div>
  );
}
