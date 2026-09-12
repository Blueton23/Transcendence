import Button from "@/shared/ui/Button";
import Icon from "@/shared/ui/Icon";
import IconButton from "@/shared/ui/IconButton";

interface PinIdeaButtonProps {
  onClick: () => void;
}

export function PinIdeaButton({ onClick }: PinIdeaButtonProps) {
  return (
    <>
      <div className="md:hidden">
        <IconButton
          icon={<Icon name="pinplus" size={18} />}
          label="Épingler une idée"
          variant="primary"
          onClick={onClick}
        />
      </div>

      <div className="hidden md:block">
        <Button
          variant="primary"
          icon={<Icon name="pinplus" size={18} />}
          onClick={onClick}
        >
          Épingler une idée
        </Button>
      </div>
    </>
  );
}

/*
Fonction pour le boutton sur la page "Epingler une idée"
*/
