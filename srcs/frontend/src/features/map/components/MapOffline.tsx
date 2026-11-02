import Icon from "@/shared/ui/Icon";
import Text from "@/shared/ui/Text";
import { useTranslation } from "react-i18next";

export function MapOffline() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-surface md:h-full">
      <Icon name="wifi-off" size={16}></Icon>
      <Text font="sans">{t("map.offline")}</Text>
    </div>
  );
}
