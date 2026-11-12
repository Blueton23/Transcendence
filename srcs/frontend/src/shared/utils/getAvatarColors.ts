import type { AvatarColor } from "@/shared/ui/Avatar";

const colors = ["1", "2", "3", "4", "5", "6", "7"] as const;

export function getAvatarColor(
  travelers: { id: number }[],
  travelerId: number,
): AvatarColor {
  const ids = travelers.map((t) => t.id).sort((a, b) => a - b);
  const index = ids.indexOf(travelerId);
  return colors[(index === -1 ? travelerId : index) % colors.length];
}
