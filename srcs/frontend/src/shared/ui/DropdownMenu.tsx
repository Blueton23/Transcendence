import { useRef, type ReactNode } from "react";
import { useOnClickOutside } from "../hooks/useOnClickOutside";
import { useEscapeKey } from "../hooks/useEscapeKey";
import Card from "./Card";

interface DropdownMenuProps {
  children: ReactNode;
  onClose: () => void;
  className?: string;
}

const baseStyle = "absolute z-10";

function DropdownMenu({
  children,
  onClose,
  className = "",
}: DropdownMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(menuRef, onClose);
  useEscapeKey(onClose);

  return (
    <div ref={menuRef} className={`${baseStyle} ${className}`}>
      <Card variant="default" className="flex flex-col p-2!">
        {children}
      </Card>
    </div>
  );
}

export default DropdownMenu;
