import { useAuth } from "@/features/auth/context/useAuth";
import { BalanceAndSettlements } from "@/features/spending/components/summary/BalanceAndSettlements";
import { ByCategory } from "@/features/spending/components/summary/ByCategory";
import type { SpendingSummary as Summary } from "@/features/spending/types";
import type { Travel } from "@/features/travel/types";
import Card from "@/shared/ui/Card";
import Heading from "@/shared/ui/Heading";
import Text from "@/shared/ui/Text";
import { useTranslation } from "react-i18next";

export function SpendingSummary({
  travel,
  summary,
}: {
  travel: Travel;
  summary: Summary;
}) {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const myBalance = summary.balances.find(
    (b) => b.travelerId === currentUser?.id,
  );
  return (
    <div className="flex flex-col gap-5">
      <div className="grid auto-cols-36 grid-flow-col gap-2 overflow-x-auto md:auto-cols-40">
        <Card variant="dark" className="flex flex-col gap-0.5">
          <Text size="sm" className="font-semibold text-inverse!">
            {t("spending.total")}
          </Text>
          <Heading
            size="sm"
            className="pt-3 font-mono font-semibold text-inverse!"
          >
            {`${summary.total} CHF`}
          </Heading>
          <Text className="text-inverse!">
            {t("spending.yourShare", {
              amount: Math.round(Number(myBalance.owed)),
            })}
          </Text>
        </Card>
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
