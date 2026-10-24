import Button from "@/shared/ui/Button";
import Icon from "@/shared/ui/Icon";
import IconButton from "@/shared/ui/IconButton";
import { useTranslation } from "react-i18next";

interface PinIdeaButtonProps {
  onClick: () => void;
}

export function PinIdeaButton({ onClick }: PinIdeaButtonProps) {
  const { t } = useTranslation();
  return (
    <>
      {/* Gère le mobile */}
      <div className="md:hidden">
        <IconButton
          icon={<Icon name="pinplus" size={18} />}
          label={t("idea.pinIdea")}
          variant="primary"
          onClick={onClick}
        />
      </div>

      {/* Gère le desktop */}
      <div className="hidden md:block">
        <Button
          variant="primary"
          icon={<Icon name="pinplus" size={18} />}
          onClick={onClick}
          className="w-full"
        >
          {t("idea.pinIdea")}
        </Button>
      </div>
    </>
  );
}

/*
Fonction pour le boutton sur la page "Epingler une idée"
*/
