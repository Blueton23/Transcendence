import { TravelOptionsButton } from "@/features/travel/components/TravelOptionsButton";
import type { Travel } from "@/features/travel/types";
import { computeTravelDates } from "@/features/travel/utils/computeTravelDates";
import Text from "@/shared/ui/Text";
import { useNavigate } from "react-router";

interface FinishedTravelListProps {
  travels: Travel[];
  onChange: () => void;
}

export function FinishedTravelList({
  travels,
  onChange,
}: FinishedTravelListProps) {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 gap-2 md:grid-cols-[repeat(auto-fill,minmax(16rem,1fr))]">
      {travels.map((travel) => (
        <div
          key={travel.id}
          className="flex items-center gap-3 rounded-md bg-surface-container px-4 py-3"
        >
          <span className="w-1.5 self-stretch rounded-full bg-border-collection" />
          <button
            type="button"
            onClick={() => navigate(`/travel/${travel.id}/`)}
            className="flex min-w-0 flex-1 flex-col text-left"
          >
            <Text className="truncate font-bold text-text-secondary!">
              {travel.title}
            </Text>
            <Text size="sm" tone="muted">
              {computeTravelDates(travel.startDate, travel.endDate)}
            </Text>
          </button>
          <TravelOptionsButton
            travel={travel}
            variant="light"
            onLeave={onChange}
          />
        </div>
      ))}
    </div>
  );
}
