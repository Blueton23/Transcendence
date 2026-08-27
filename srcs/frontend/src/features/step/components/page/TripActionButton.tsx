import Button from "@/shared/ui/Button";
import AddExpenseButton from "@/features/spending/components/AddExpenseButton";

export function TripActionsButton() {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:gap-5">
      <Button variant="primary" className="flex-1">
        Epingler une idee
      </Button>
      <AddExpenseButton className="flex-1" />
    </div>
  );
}
