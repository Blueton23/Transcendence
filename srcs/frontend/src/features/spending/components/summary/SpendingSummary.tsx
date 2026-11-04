import { BalanceAndSettlements } from "@/features/spending/components/summary/BalanceAndSettlements";
import { ByCategory } from "@/features/spending/components/summary/ByCategory";

export function SpendingSummary() {
  return (
    <div className="flex flex-col gap-5">
      <ByCategory />
      <BalanceAndSettlements />
    </div>
  );
}
