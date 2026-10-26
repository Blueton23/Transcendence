import IconButton from "@/shared/ui/IconButton";
import Heading from "@/shared/ui/Heading";
import Icon from "@/shared/ui/Icon";
import Button from "@/shared/ui/Button";
import { useTranslation } from "react-i18next";

export function StepDetailHeader({
  onBack,
  onModify,
}: {
  onBack: () => void;
  onModify: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center gap-5">
        <IconButton
          variant="flat"
          icon={<Icon name="back" size={16} />}
          label={t("step.backToItinerary")}
          onClick={onBack}
        />
        <Heading size="md">{t("step.detail")}</Heading>
      </div>
      <Button
        onClick={onModify}
        variant="ghost"
        icon={<Icon name="edit" size={16} />}
      >
        {t("actions.modify")}
      </Button>
    </div>
  );
}
