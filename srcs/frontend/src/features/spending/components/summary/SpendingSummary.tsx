import { BalanceAndSettlements } from "@/features/spending/components/summary/BalanceAndSettlements";
import { ByCategory } from "@/features/spending/components/summary/ByCategory";
import type { SpendingSummary as Summary } from "@/features/spending/types";

export function SpendingSummary({summary} : {summary: Summary}) {
  return (
    <div className="flex flex-col gap-5">
    <div className="flex flex-wrap gap-3">
      {summary.byCategory.map((c) => (
      <ByCategory key={c.category} category={c.category} total={c.total} />
    ))}
    </div>
      <BalanceAndSettlements />
    </div>

  );
}
