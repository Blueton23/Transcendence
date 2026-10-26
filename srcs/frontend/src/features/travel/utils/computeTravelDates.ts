import { getDateLocale } from "@/shared/utils/dateLocale";

export function computeTravelDates(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const startDay = start.getDate();
  const endDay = end.getDate();
  const startMonth = start.toLocaleDateString(getDateLocale(), {
    month: "short",
  });
  const endMonth = end.toLocaleDateString(getDateLocale(), { month: "short" });
  return startMonth === endMonth
    ? `${startDay}-${endDay} ${startMonth}`
    : `${startDay} ${startMonth} - ${endDay} ${endMonth}`;
}
