import { useState } from "react";
import { useTranslation } from "react-i18next";
import DropdownMenu from "@/shared/ui/DropdownMenu";
import Icon, { type IconName } from "@/shared/ui/Icon";
import IconButton from "@/shared/ui/IconButton";
import MenuItem from "@/shared/ui/MenuItem";

interface ExtraAction {
  icon: IconName;
  label: string;
  onClick: () => void;
}

interface OptionsMenuProps {
  onEdit: () => void;
  onDelete: () => void;
  onOpenChange?: (open: boolean) => void;
  editLabel?: string;
  deleteLabel?: string;
  extraActions?: ExtraAction[];
  disabled?: boolean;
  variant?: "flat" | "ghost";
}

export function OptionsMenu({
  onEdit,
  onDelete,
  onOpenChange,
  editLabel,
  deleteLabel,
  extraActions = [],
  disabled = false,
  variant = "flat",
}: OptionsMenuProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { t } = useTranslation();

  const setOpen = (open: boolean) => {
    setMenuOpen(open);
    onOpenChange?.(open);
  };

  // Closes menu after each action
  const closeAfter = (action: () => void) => () => {
    action();
    setOpen(false);
  };

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <IconButton
        icon={<Icon name="dots" size={18} />}
        label={t("actions.options")}
        variant={variant}
        size="xs"
        disabled={disabled}
        onClick={() => setOpen(!menuOpen)}
        onMouseDown={(e) => e.stopPropagation()}
      />
      {menuOpen && !disabled && (
        <DropdownMenu
          onClose={() => setOpen(false)}
          className="top-full right-0 mt-2"
        >
          {extraActions.map((action) => (
            <MenuItem
              key={action.label}
              icon={action.icon}
              onClick={closeAfter(action.onClick)}
            >
              {action.label}
            </MenuItem>
          ))}
          <MenuItem icon="edit" onClick={closeAfter(onEdit)}>
            {editLabel ?? t("actions.modify")}
          </MenuItem>
          <MenuItem icon="x" tone="danger" onClick={closeAfter(onDelete)}>
            {deleteLabel ?? t("actions.delete")}
          </MenuItem>
        </DropdownMenu>
      )}
    </div>
  );
}
