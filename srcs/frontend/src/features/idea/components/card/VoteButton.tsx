import Button from "@/shared/ui/Button";
import Icon from "@/shared/ui/Icon";
import { useTranslation } from "react-i18next";

interface VoteButtonProps {
  voteCount: number;
  voted: boolean;
  onVote: () => void;
  disabled?: boolean;
}

export function VoteButton({
  voteCount,
  voted,
  onVote,
  disabled = false,
}: VoteButtonProps) {
  const { t } = useTranslation();
  return (
    <Button
      type="button"
      variant={voted ? "primary" : "outline"}
      size="sm"
      icon={<Icon name="heart-f" size={16} />}
      onClick={onVote}
      disabled={disabled}
      aria-pressed={voted}
      aria-label={voted ? t("idea.removeVote") : t("idea.addVote")}
    >
      {voteCount}
    </Button>
  );
}

/*
Fonction du bouton de droite de vote avec l'icone coeur
*/
