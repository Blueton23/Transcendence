import Divider from "@/shared/ui/Divider";
import Text from "@/shared/ui/Text";
import { useTranslation } from "react-i18next";

export default function UnreadSeparator() {
  const { t } = useTranslation();

  return (
    <div
      className="flex items-center gap-3 py-4"
      aria-label={t("chat.unreadMessages")}
    >
      <div className="flex-1">
        <Divider className="bg-brand-primary" />
      </div>

      <Text size="sm" tone="accent">
        {t("chat.unreadSeparator")}
      </Text>

      <div className="flex-1">
        <Divider className="bg-brand-primary" />
      </div>
    </div>
  );
}
