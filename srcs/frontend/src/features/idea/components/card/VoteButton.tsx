import Button from "@/shared/ui/Button";
import Icon from "@/shared/ui/Icon";

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
  return (
    <Button
      type="button"
      variant={voted ? "primary" : "outline"}
      size="sm"
      icon={<Icon name="heart-f" size={16} />}
      onClick={onVote}
      disabled={disabled}
      aria-pressed={voted}
      aria-label={voted ? "Retirer mon vote" : "Ajouter mon vote"}
    >
      {voteCount}
    </Button>
  );
}

/*
Fonction du bouton de droite de vote avec l'icone coeur
*/
