import { type SpendingSummary } from "@/features/spending/types";
import { getPayer } from "@/features/spending/utils/getPayer";
import type { Travel } from "@/features/travel/types";
import Avatar from "@/shared/ui/Avatar";
import Card from "@/shared/ui/Card";
import Divider from "@/shared/ui/Divider";
import Text from "@/shared/ui/Text";

export function BalanceAndSettlements({
  summary,
  travel,
}: {
  summary: SpendingSummary;
  travel: Travel;
}) {
  return (
    <Card>
      <div className="flex flex-col gap-2">
        <div className="flex flex-row gap-5">
          {summary.balances.map((b) => {
            const traveler = getPayer(travel, summary, b.travelerId);
            return (
              <div key={b.travelerId} className="flex items-center gap-2">
                <Avatar color={traveler.color}>{traveler.initials}</Avatar>
                <Text className="font-bold">{traveler.name}</Text>
                {Number(b.balance) >= 0 ? (
                  <Text font="mono" tone="success" className="font-bold">
                    {b.balance}
                  </Text>
                ) : (
                  <Text font="mono" tone="accent" className="font-bold">
                    {b.balance}
                  </Text>
                )}
              </div>
            );
          })}
        </div>
        <Divider />
        {summary.settlements.map((s) => {
          const debtor = getPayer(travel, summary, s.debtorId);
          const creditor = getPayer(travel, summary, s.creditorId);
          return (
            <Card
              key={`${s.debtorId}-${s.creditorId}`}
              className="flex items-center justify-between bg-white!"
            >
              <div className="flex items-center gap-2">
                <Avatar color={debtor.color}>{debtor.initials}</Avatar>
                <Text className="font-bold">{debtor.name}</Text>
                <Text className="font-bold">{"->"}</Text>
                <Avatar color={creditor.color}>{creditor.initials}</Avatar>
                <Text className="font-bold">{creditor.name}</Text>
              </div>
              <Text className="font-bold">{s.amount}</Text>
            </Card>
          );
        })}
      </div>
    </Card>
  );
}
