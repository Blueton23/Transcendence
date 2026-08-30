import Button from "../../../../shared/ui/Button";
import Icon from "../../../../shared/ui/Icon";
import IconButton from "../../../../shared/ui/IconButton";

interface PinIdeaButtonProps {
  onClick: () => void;
}

export function PinIdeaButton({ onClick }: PinIdeaButtonProps) {
  return (
    <>
      <div className="sm:hidden">
        <IconButton
          icon={<Icon name="pinplus" size={18} />}
          label="Épingler une idée"
          variant="primary"
          onClick={onClick}
        />
      </div>

      <div className="hidden sm:block">
        <Button variant="primary" onClick={onClick}>
          <Icon name="pinplus" size={18} />
          Épingler une idée
        </Button>
      </div>
    </>
  );
}

/*
Fonction pour le boutton épingler une idée
*/
