import { useTranslation } from "react-i18next";

import Badge from "@/shared/ui/Badge";
import Icon from "@/shared/ui/Icon";

interface OnlineStatusProps {
  isOnline: boolean;
}

function OnlineStatus({ isOnline }: OnlineStatusProps) {
  const { t } = useTranslation();

  return (
    <Badge
      variant={isOnline ? "success" : "warning"}
      icon={<Icon name={isOnline ? "check" : "moon"} size={14} />}
    >
      {isOnline ? t("friendship.online") : t("friendship.offline")}
    </Badge>
  );
}

export default OnlineStatus;
