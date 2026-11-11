import { type SpendingSummary } from "@/features/spending/types";
import { getPayer } from "@/features/spending/utils/getPayer";
import type { Travel } from "@/features/travel/types";
import Avatar from "@/shared/ui/Avatar";
import Card from "@/shared/ui/Card";
import Heading from "@/shared/ui/Heading";
import Icon from "@/shared/ui/Icon";
import Text from "@/shared/ui/Text";
import { useTranslation } from "react-i18next";

export function BalanceAndSettlements({
  summary,
  travel,
}: {
  summary: SpendingSummary;
  travel: Travel;
}) {
  const rowStyle = "flex items-center gap-2 rounded-sm bg-background px-3 py-2";
  const { t } = useTranslation();
  return (
    <Card className="grid gap-6 p-4! md:grid-cols-2">
      <section className="flex flex-col gap-2">
        <Heading>{t("spending.balances")}</Heading>
        {summary.balances.map((b) => {
          const traveler = getPayer(travel, summary, b.travelerId);
          const amount = Number(b.balance);
          return (
            <div key={b.travelerId} className={rowStyle}>
              <Avatar size="sm" color={traveler.color}>
                {traveler.initials}
              </Avatar>
              <Text className="min-w-0 flex-1 truncate font-semibold">
                {traveler.name}
              </Text>
              {amount >= 0 ? (
                <Text font="mono" tone="success" className="font-bold">
                  {`${b.balance} CHF`}
                </Text>
              ) : (
                <Text font="mono" tone="accent" className="font-bold">
                  {`${b.balance} CHF`}
                </Text>
              )}
            </div>
          );
        })}
      </section>
      <section className="flex flex-col gap-2 md:border-l md:border-border md:pl-6">
        <Heading>{t("spending.settlements")}</Heading>
        {summary.settlements.map((s) => {
          const debtor = getPayer(travel, summary, s.debtorId);
          const creditor = getPayer(travel, summary, s.creditorId);
          return (
            <div key={`${s.debtorId}-${s.creditorId}`} className={rowStyle}>
              <Avatar size="sm" color={debtor.color}>
                {debtor.initials}
              </Avatar>
              <Text className="min-w-0 truncate font-semibold">
                {debtor.name}
              </Text>
              <Icon name="arrow" size={16} className="shrink-0 text-muted" />
              <span className="sr-only">{t("spending.owesTo")}</span>
              <Avatar size="sm" color={creditor.color}>
                {creditor.initials}
              </Avatar>
              <Text className="min-w-0 flex-1 truncate font-semibold">
                {creditor.name}
              </Text>
              <Text font="mono" className="font-semibold whitespace-nowrap">
                {`${s.amount} CHF`}
              </Text>
            </div>
          );
        })}
      </section>
    </Card>
  );
}
