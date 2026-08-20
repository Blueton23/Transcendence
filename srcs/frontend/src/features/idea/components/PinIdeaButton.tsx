import Button from "../../../shared/ui/Button";
import Icon from "../../../shared/ui/Icon";

interface PinIdeaButtonProps {
  onClick?: () => void;
}

export function PinIdeaButton({ onClick }: PinIdeaButtonProps) {
  return (
    <Button variant="primary" icon={<Icon name="pinplus" size={16} />} onClick={onClick}>
      Épingler une idée
    </Button>
  );
}
