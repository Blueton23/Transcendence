import { BalanceAndSettlements } from "@/features/spending/components/summary/BalanceAndSettlements";
import { ByCategory } from "@/features/spending/components/summary/ByCategory";
import type { SpendingSummary as Summary } from "@/features/spending/types";
import type { Travel } from "@/features/travel/types";

export function SpendingSummary({
  travel,
  summary,
}: {
  travel: Travel;
  summary: Summary;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid auto-cols-40 grid-flow-col gap-2 overflow-x-auto md:auto-cols-45">
        {summary.byCategory.map((c) => (
          <ByCategory
            key={c.category}
            category={c.category}
            totalCategory={c.total}
            total={summary.total}
          />
        ))}
      </div>
      <BalanceAndSettlements travel={travel} summary={summary} />
    </div>
  );
}
