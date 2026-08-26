import Button from "../../../shared/ui/Button";
import Icon from "../../../shared/ui/Icon";

interface VoteButtonProps {
  voteCount: number;
  voted: boolean;
  onVote?: () => void;
}

export function VoteButton({ voteCount, voted, onVote, }: VoteButtonProps) {
  return (
    <Button
      variant={voted ? "primary" : "gray"}
      onClick={onVote}
      className="!px-3 !py-2 !text-xs sm:!px-5 sm:!py-3 sm:!text-sm"
    >
      {<Icon name="heart-f" size={16} />}
      {voteCount}
    </Button>
  );
}
