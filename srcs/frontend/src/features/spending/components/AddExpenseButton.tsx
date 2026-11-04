import { useTranslation } from "react-i18next";
import Button from "../../../shared/ui/Button";
import Icon from "../../../shared/ui/Icon";

interface AddExpenseButtonProps {
  onClick: () => void;
  className?: string;
}

function AddExpenseButton({ className = "", onClick }: AddExpenseButtonProps) {
  const { t } = useTranslation();
  return (
    <Button
      variant="outline"
      icon={<Icon name="cash" />}
      className={className}
      onClick={onClick}
    >
      {t("step.addExpense")}
    </Button>
  );
}
export default AddExpenseButton;
