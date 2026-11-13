import { useTranslation } from "react-i18next";

interface OnlineDotProps {
  isOnline: boolean;
}

// Green dot on an avatar; the parent needs to be relative !!!
function OnlineDot({ isOnline }: OnlineDotProps) {
  const { t } = useTranslation();
  if (!isOnline) {
    return null;
  }
  return (
    <span className="absolute -right-0.5 -bottom-0.5 size-3 rounded-full bg-success ring-2 ring-surface">
      <span className="sr-only">{t("profile.online")}</span>
    </span>
  );
}
export default OnlineDot;
