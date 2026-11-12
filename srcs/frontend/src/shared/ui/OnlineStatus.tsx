import Dot from "@/shared/ui/Dot";
import Tag from "@/shared/ui/Tag";
import { useTranslation } from "react-i18next";

interface OnlineStatusProps {
  isOnline: boolean;
}

function OnlineStatus({ isOnline }: OnlineStatusProps) {
  const { t } = useTranslation();
  const tagsColors = isOnline
    ? "bg-success-bg text-success-text"
    : "bg-surface-container text-muted";
  const dotColor = isOnline ? "bg-success" : "bg-muted";
  return (
    <Tag
      tone="plain"
      icon={<Dot className={dotColor} />}
      className={tagsColors}
    >
      {isOnline ? t("profile.online") : t("profile.offline")}
    </Tag>
  );
}

export default OnlineStatus;
