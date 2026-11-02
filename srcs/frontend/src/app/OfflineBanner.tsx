import { useOnlineNetworkStatus } from "@/shared/hooks/useOnlineNetworkStatus";
import Banner from "@/shared/ui/Banner";
import Icon from "@/shared/ui/Icon";
import { useTranslation } from "react-i18next";

export function OfflineBanner() {
  const { t } = useTranslation();
  const isOnline = useOnlineNetworkStatus();
  if (isOnline) return null;

  return (
    <Banner variant="warning" icon={<Icon name="wifi-off" size={16} />}>
      {t("pwa.offline")}
    </Banner>
  );
}
