import Button from "@/shared/ui/Button";
import Icon from "@/shared/ui/Icon";

interface VoteButtonProps {
  voteCount: number;
  voted: boolean;
  onVote: () => void;
}

export function VoteButton({ voteCount, voted, onVote }: VoteButtonProps) {
  return (
    <Button
      variant={voted ? "primary" : "outline"}
      size="sm"
      icon={<Icon name="heart-f" size={16} />}
      onClick={onVote}
    >
      {voteCount}
    </Button>
  );
}

/*
Fonction du bouton de droite de vote avec l'icone coeur
*/
