import AddExpenseButton from "@/features/spending/components/AddExpenseButton";
import { useState } from "react";
import IconButton from "@/shared/ui/IconButton";
import Icon from "@/shared/ui/Icon";
import DropdownMenu from "@/shared/ui/DropdownMenu";
import MenuItem from "@/shared/ui/MenuItem";
import { PinIdeaButton } from "@/features/idea/components/page/PinIdeaButton";

export function TripActionsButton({ onPinIdea }: { onPinIdea: () => void }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <div className="hidden gap-5 grid-cols-2 md:grid">
        <PinIdeaButton onClick={onPinIdea}/>
        <AddExpenseButton/>
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
            <MenuItem
              icon="pinplus"
              onClick={() => {
                setIsOpen(false);
                onPinIdea();
              }}
            >
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
