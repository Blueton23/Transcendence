import MenuItem from "../shared/ui/MenuItem";
import DropdownMenu from "../shared/ui/DropdownMenu";
import IconButton from "../shared/ui/IconButton";
import Icon from "../shared/ui/Icon";
import { useState } from "react";

export function DropdownDemo() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="relative inline-block">
      <IconButton
        icon={<Icon name="dots" size={16} />}
        label="Options"
        onClick={() => setIsOpen((v) => !v)}
        onMouseDown={(e) => e.stopPropagation()}
      />
      {isOpen && (
        <DropdownMenu
          onClose={() => setIsOpen(false)}
          className="top-full left-0 mt-2"
        >
          <MenuItem icon="search">Partager</MenuItem>
          <MenuItem icon="users">Gérer les voyageurs</MenuItem>
          <MenuItem icon="cal">Changer les dates</MenuItem>
          <MenuItem icon="ext">Exporter vers Google Maps</MenuItem>
          <MenuItem icon="x" tone="danger">
            Quitter le voyage
          </MenuItem>
        </DropdownMenu>
      )}
    </div>
  );
}
