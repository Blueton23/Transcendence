import Text from "@/shared/ui/Text";
import { useTranslation } from "react-i18next";

const lineStyle = "h-px flex-1 bg-brand-primary";

export default function UnreadSeparator() {
  const { t } = useTranslation();

  return (
    <div
      role="separator"
      aria-label={t("chat.unreadMessages")}
      className="flex items-center gap-3 py-4"
    >
      <span aria-hidden="true" className={lineStyle} />
      <Text
        as="span"
        size="sm"
        font="mono"
        className="font-medium tracking-wider text-brand-primary-strong!"
      >
        {t("chat.unreadSeparator")}
      </Text>
      <span aria-hidden="true" className={lineStyle} />
    </div>
  );
}
