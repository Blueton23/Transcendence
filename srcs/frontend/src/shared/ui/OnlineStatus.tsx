import Badge from "@/shared/ui/Badge";
import Icon from "@/shared/ui/Icon";

interface OnlineStatusProps {
  isOnline: boolean;
}

function OnlineStatus({ isOnline }: OnlineStatusProps) {
  return (
    <Badge
      variant={isOnline ? "success" : "warning"}
      icon={<Icon name={isOnline ? "check" : "moon"} size={14} />}
    >
      {isOnline ? "En ligne" : "Hors ligne"}
    </Badge>
  );
}

export default OnlineStatus;
