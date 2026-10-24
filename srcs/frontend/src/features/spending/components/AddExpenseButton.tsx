import { useTranslation } from "react-i18next";
import Button from "../../../shared/ui/Button";
import Icon from "../../../shared/ui/Icon";

interface AddExpenseButtonProps {
  className?: string;
}

function AddExpenseButton({ className = "" }: AddExpenseButtonProps) {
  const { t } = useTranslation();
  return (
    <Button variant="outline" icon={<Icon name="cash" />} className={className}>
      {t("step.addExpense")}
    </Button>
  );
}
export default AddExpenseButton;
