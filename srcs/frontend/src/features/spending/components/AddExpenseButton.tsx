import Button from "../../../shared/ui/Button";
import Icon from "../../../shared/ui/Icon";

interface AddExpenseButtonProps {
  className?: string;
}

function AddExpenseButton({ className = "" }: AddExpenseButtonProps) {
  return (
    <Button variant="outline" icon={<Icon name="cash" />} className={className}>
      Ajouter une dépense
    </Button>
  );
}
export default AddExpenseButton;
