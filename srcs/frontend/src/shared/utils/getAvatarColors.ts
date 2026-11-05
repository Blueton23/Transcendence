import { colors } from "@/features/spending/types";
import type { AvatarColor } from "@/shared/ui/Avatar";

export function getAvatarColor(
  travelers: { id: number }[],
  travelerId: number,
): AvatarColor {
  const ids = travelers.map((t) => t.id).sort((a, b) => a - b);
  const index = ids.indexOf(travelerId);
  return colors[(index === -1 ? travelerId : index) % colors.length];
}
