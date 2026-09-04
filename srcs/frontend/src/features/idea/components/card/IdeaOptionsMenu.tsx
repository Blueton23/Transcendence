import { useState } from "react";
import IconButton from "../../../../shared/ui/IconButton";
import DropdownMenu from "../../../../shared/ui/DropdownMenu";
import MenuItem from "../../../../shared/ui/MenuItem";
import Icon from "../../../../shared/ui/Icon";

interface IdeaOptionsMenuProps {
  onEdit: () => void;
  onDelete: () => void;
}

export function IdeaOptionsMenu({ onEdit, onDelete }: IdeaOptionsMenuProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative">
      <IconButton
        icon={<Icon name="dots" size={18} />}
        label="Options de l'idée"
        variant="flat"
        size="sm"
        className="!h-7 !w-7 sm:!h-[34px] sm:!w-[34px]"
        onClick={() => setMenuOpen((open) => !open)}
      />

      {menuOpen && (
        <DropdownMenu
          onClose={() => setMenuOpen(false)}
          className="top-full right-0 mt-2"
        >
          <MenuItem
            icon="edit"
            onClick={() => {
              onEdit();
              setMenuOpen(false);
            }}
          >
            Modifier
          </MenuItem>

          <MenuItem
            icon="x"
            tone="danger"
            onClick={() => {
              onDelete();
              setMenuOpen(false);
            }}
          >
            Supprimer
          </MenuItem>
        </DropdownMenu>
      )}
    </div>
  );
}
