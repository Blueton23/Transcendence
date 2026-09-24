import Button from "@/shared/ui/Button";
import AddExpenseButton from "@/features/spending/components/AddExpenseButton";
import { useState } from "react";
import IconButton from "@/shared/ui/IconButton";
import Icon from "@/shared/ui/Icon";
import DropdownMenu from "@/shared/ui/DropdownMenu";
import MenuItem from "@/shared/ui/MenuItem";

// Button epingler une idee a importer une fois que la features chez David existe

export function TripActionsButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <div className="hidden gap-5 md:flex">
        <Button variant="primary" className="flex-1">
          Epingler une idee
        </Button>
        <AddExpenseButton className="flex-1" />
      </div>
      <div
        className="fixed right-5 bottom-20 z-30 md:hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <IconButton
          icon={<Icon name="plus" size={25} />}
          label="Action"
          variant="outline"
          size="lg"
          className="border-2 border-brand-primary! bg-surface-control! text-brand-primary!"
          onClick={() => setIsOpen(!isOpen)}
          onMouseDown={(e) => e.stopPropagation()}
        />
        {isOpen && (
          <DropdownMenu
            onClose={() => setIsOpen(false)}
            className="right-0 bottom-full mb-2"
          >
            <MenuItem icon="pinplus" onClick={() => setIsOpen(false)}>
              Epingler une idee
            </MenuItem>
            <MenuItem icon="cash" onClick={() => setIsOpen(false)}>
              Ajouter une depense
            </MenuItem>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}
