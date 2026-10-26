import Button from "@/shared/ui/Button";
import Card from "@/shared/ui/Card";
import Text from "@/shared/ui/Text";
import { useTranslation } from "react-i18next";

export function NoNight({ onAddLodging }: { onAddLodging: () => void }) {
  const { t } = useTranslation();
  return (
    <Card variant="dashed" className="flex items-center justify-between p-2!">
      <Text tone="muted">{t("step.noLodging")}</Text>
      <Button variant="outline" size="sm" onClick={onAddLodging}>
        {t("step.addLodging")}
      </Button>
    </Card>
  );
}
