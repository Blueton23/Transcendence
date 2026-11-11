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
    <div className="flex items-center justify-between pt-4 md:pt-0">
      <Button
        variant="ghost"
        icon={<Icon name="back" size={16} />}
        onClick={onBack}
        className="px-0! font-semibold! tracking-normal!"
      >
        {t("step.backToItinerary")}
      </Button>
      <Button
        onClick={onModify}
        variant="outline"
        size="xs"
        icon={<Icon name="edit" size={14} />}
        className="hidden md:inline-flex"
      >
        {t("step.edit")}
      </Button>
    </div>
  );
}
