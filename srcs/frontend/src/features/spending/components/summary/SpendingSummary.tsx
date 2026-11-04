import { BalanceAndSettlements } from "@/features/spending/components/summary/BalanceAndSettlements";
import { ByCategory } from "@/features/spending/components/summary/ByCategory";

export function SpendingSummary() {
  return (
    <div>
      <ByCategory />
      <BalanceAndSettlements />
    </div>
  );
}
