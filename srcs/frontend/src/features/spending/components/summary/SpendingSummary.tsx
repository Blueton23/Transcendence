import { BalanceAndSettlements } from "@/features/spending/components/summary/BalanceAndSettlements";
import { ByCategory } from "@/features/spending/components/summary/ByCategory";
import type { SpendingSummary as Summary } from "@/features/spending/types";

export function SpendingSummary({summary} : {summary: Summary}) {
  return (
    <div className="flex flex-col gap-5">
    <div className="grid grid-flow-col md:auto-cols-45 auto-cols-40 overflow-x-auto gap-2">
      {summary.byCategory.map((c) => (
      <ByCategory key={c.category} category={c.category} totalCategory={c.total} total={summary.total} />
    ))}
    </div>
      <BalanceAndSettlements />
    </div>

  );
}
