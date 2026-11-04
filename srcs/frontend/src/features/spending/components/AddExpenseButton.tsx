import { useTranslation } from "react-i18next";
import Button from "../../../shared/ui/Button";
import Icon from "../../../shared/ui/Icon";
import IconButton from "@/shared/ui/IconButton";

interface AddExpenseButtonProps {
  onClick: () => void;
}

function AddExpenseButton({ onClick }: AddExpenseButtonProps) {
  const { t } = useTranslation();
  return (
    <>
      <div className="md:hidden">
        <IconButton
          icon={<Icon name="plus" size={28} />}
          label={t("spending.add")}
          variant="primary"
          onClick={onClick}
          size="lg"
        />
      </div>

      <div className="hidden md:block">
        <Button
          variant="primary"
          icon={<Icon name="pinplus" size={18} />}
          onClick={onClick}
          className="w-full"
        >
          {t("spending.add")}
        </Button>
      </div>
    </>
  );
}
export default AddExpenseButton;
