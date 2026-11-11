import Button from "@/shared/ui/Button";
import Icon from "@/shared/ui/Icon";
import { useTranslation } from "react-i18next";

// Vote button style: on an idea card (Ideas page) or in a step detail row.
const voteStyles = {
  card: { voted: "white", idle: "outline" },
  row: { voted: "voted", idle: "ghost" },
} as const;

interface VoteButtonProps {
  voteCount: number;
  voted: boolean;
  onVote: () => void;
  disabled?: boolean;
  ideaCard?: boolean;
}

export function VoteButton({
  voteCount,
  voted,
  ideaCard = false,
  onVote,
  disabled = false,
}: VoteButtonProps) {
  const { t } = useTranslation();
  const style = voteStyles[ideaCard ? "card" : "row"];
  return (
    <Button
      type="button"
      variant={voted ? style.voted : style.idle}
      size="xs"
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
