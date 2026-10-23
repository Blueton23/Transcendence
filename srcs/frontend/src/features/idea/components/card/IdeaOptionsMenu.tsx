import { useState } from "react";
import IconButton from "@/shared/ui/IconButton";
import DropdownMenu from "@/shared/ui/DropdownMenu";
import MenuItem from "@/shared/ui/MenuItem";
import Icon from "@/shared/ui/Icon";
import { useTranslation } from "react-i18next";

interface IdeaOptionsMenuProps {
  onEdit: () => void;
  onDelete: () => void;
  onChoose?: () => void;
  disabled?: boolean;
}

export function IdeaOptionsMenu({
  onEdit,
  onDelete,
  onChoose,
  disabled = false,
}: IdeaOptionsMenuProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <div className="relative">
      <IconButton
        icon={<Icon name="dots" size={18} />}
        label={t("idea.options")}
        variant="flat"
        size="xs"
        disabled={disabled}
        onClick={() => setMenuOpen((open) => !open)}
      />

      {menuOpen && !disabled && (
        <DropdownMenu
          onClose={() => setMenuOpen(false)}
          className="top-full right-0 mt-2"
        >
          {onChoose && (
            <MenuItem
              icon="check"
              onClick={() => {
                onChoose();
                setMenuOpen(false);
              }}
            >
              {t("idea.chooseLodging")}
            </MenuItem>
          )}

          <MenuItem
            icon="edit"
            onClick={() => {
              onEdit();
              setMenuOpen(false);
            }}
          >
            {t("actions.modify")}
          </MenuItem>

          <MenuItem
            icon="x"
            tone="danger"
            onClick={() => {
              onDelete();
              setMenuOpen(false);
            }}
          >
            {t("actions.delete")}
          </MenuItem>
        </DropdownMenu>
      )}
    </div>
  );
}

/*
Fonction du bouton de droite menu d'option (...)
Permet de "Modifier / Supprimer"
*/
