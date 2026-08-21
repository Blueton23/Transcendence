import Heading from "./Heading";
import Icon, { type IconName } from "./Icon";
import IconBadge from "./IconBadge";
import IconButton from "./IconButton";
import type { ReactNode } from "react";
import { iconColor } from "./iconColor";

interface ModalProps {
  children: ReactNode;
  icon?: IconName;
  title: string;
  onClose: () => void;
}

function Modal({ icon, title, children, onClose }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-scrim/30">
      <div className="flex w-full max-w-2xl flex-col gap-6 rounded-lg bg-surface-raised p-6 shadow-lg">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <IconBadge name={icon} color={iconColor[icon] ?? "ink"} />
            <Heading level={2} size="md">
              {title}
            </Heading>
          </div>

          <IconButton
            variant="flat"
            onClick={onClose}
            size="md"
            label="Fermer"
            icon={<Icon name="x" size={16} />}
          />
        </div>
        {children}
      </div>
    </div>
  );
}

export default Modal;
