import type { Idea } from "@/features/idea/types";
import { lodgingCountNights } from "@/features/idea/utils/lodgingCountNights";
import { formatDate } from "@/features/step/utils/stepDates";
import i18n from "@/i18n";

// "20 CHF/nuit · 1 nuit"
export function lodgingDetails(idea: Idea): string {
  const parts: string[] = [];
  if (idea.pricePerNight) {
    parts.push(i18n.t("units.pricePerNight", { price: idea.pricePerNight }));
  }
  const nights = lodgingCountNights(idea);
  if (nights) {
    parts.push(nights);
  }
  return parts.join(" · ");
}

// "21.11 → 22.11"
export function lodgingDates(idea: Idea): string {
  if (!idea.arrivalDate || !idea.departureDate) return "";
  return i18n.t("step.fromTo", {
    start: formatDate(new Date(idea.arrivalDate)),
    end: formatDate(new Date(idea.departureDate)),
  });
}

// "20 CHF/nuit · 1 nuit · 21.11 → 22.11"
export function lodgingInfo(idea: Idea): string {
  return [lodgingDetails(idea), lodgingDates(idea)].filter(Boolean).join(" · ");
}
