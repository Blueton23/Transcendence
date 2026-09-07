import Heading from "./Heading";
import Icon, { type IconName } from "./Icon";
import IconBadge from "./IconBadge";
import IconButton from "./IconButton";
import type { ReactNode } from "react";
import { iconColor } from "./iconColor";
import Text from "./Text";
import { useOnClickOutside } from "../hooks/useOnClickOutside";
import { useRef } from "react";
import { useEscapeKey } from "../hooks/useEscapeKey";

interface ModalProps {
  children: ReactNode;
  icon: IconName;
  title: string;
  subtitle?: ReactNode;
  onClose: () => void;
}

type ModalHeaderProps = Omit<ModalProps, "children">;

function ModalHeader({ icon, title, subtitle, onClose }: ModalHeaderProps) {
  return (
    <div className="flex shrink-0 items-start justify-between p-8">
      <div className="flex items-center gap-4">
        <IconBadge name={icon} color={iconColor[icon] ?? "ink"} />
        <div>
          <Heading level={2} size="md">
            {title}
          </Heading>
          {subtitle && (
            <Text font="mono" size="sm" tone="muted">
              {subtitle}
            </Text>
          )}
        </div>
      </div>
      <IconButton
        variant="flat"
        onClick={onClose}
        size="md"
        label="Fermer"
        icon={<Icon name="x" size={16} />}
      />
    </div>
  );
}

const cardBase = "flex flex-col w-full bg-surface-raised";
const cardMobile = "h-dvh";
const cardDesktop =
  "md:h-auto md:max-h-[90dvh] md:max-w-2xl md:rounded-lg md:shadow-lg md:overflow-hidden";

function Modal({ icon, title, subtitle, children, onClose }: ModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(cardRef, onClose);
  useEscapeKey(onClose);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-scrim">
      <div ref={cardRef} className={`${cardBase} ${cardDesktop} ${cardMobile}`}>
        <ModalHeader
          icon={icon}
          title={title}
          subtitle={subtitle}
          onClose={onClose}
        />
        <div className="flex-1 overflow-y-auto px-8 pb-8">{children}</div>
      </div>
    </div>
  );
}

export default Modal;
