import Button from "@/shared/ui/Button";
import Card from "@/shared/ui/Card";
import Icon from "@/shared/ui/Icon";
import Text from "@/shared/ui/Text";
import { useTranslation } from "react-i18next";

export function NoNight({ onAddLodging }: { onAddLodging: () => void }) {
  const { t } = useTranslation();
  return (
    <Card variant="dashed" className="flex items-center justify-between p-2!">
      <div className="flex gap-3">
        <Icon name="moon"></Icon>
        <Text tone="muted">{t("step.noLodging")}</Text>
      </div>
      <Button variant="outline" size="xs" onClick={onAddLodging}>
        {t("step.addLodging")}
      </Button>
    </Card>
  );
}
