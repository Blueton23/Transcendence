import type { Travel } from "@/features/travel/types";

export function getNextTravel(travels: Travel[]): Travel | undefined {
  const today = new Date();
  const ongoing = travels.find(
    (t) => new Date(t.startDate) <= today && today <= new Date(t.endDate),
  );
  if (ongoing) return ongoing;

  const upcoming = travels.filter((t) => new Date(t.startDate) > today);

  const sorted = upcoming.sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
  );

  return sorted[0];
}
