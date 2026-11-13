import type { Place } from "@/features/map/types";
import { useOnlineNetworkStatus } from "@/shared/hooks/useOnlineNetworkStatus";
import Icon from "@/shared/ui/Icon";
import Text from "@/shared/ui/Text";
import { useTranslation } from "react-i18next";

interface PlaceSuggestionsProps {
  items: Place[];
  isLoading: boolean;
  failed: boolean;
  onSelect: (place: Place) => void;
  activeIndex: number;
}

export function PlaceSuggestions({
  items,
  isLoading,
  failed,
  onSelect,
  activeIndex,
}: PlaceSuggestionsProps) {
  const { t } = useTranslation();
  const isOnline = useOnlineNetworkStatus();
  return (
    <div className="absolute z-10 mt-2 flex w-full flex-col rounded-md bg-surface py-2">
      {!isOnline ? (
        <Text tone="muted" size="sm" className="px-3 py-2">
          {t("map.searchOffline")}
        </Text>
      ) : isLoading ? (
        <Text tone="muted" size="sm" className="px-3 py-2">
          {t("actions.searching")}
        </Text>
      ) : failed ? (
        <Text tone="muted" size="sm" className="px-3 py-2">
          {t("map.searchFailed")}
        </Text>
      ) : items.length > 0 ? (
        items.map((place, index) => (
          <button
            type="button"
            aria-selected={index === activeIndex}
            className={`flex cursor-pointer items-center gap-2 px-3 py-2 text-sm text-muted hover:bg-surface-raised ${
              index === activeIndex ? "bg-surface-raised text-text" : ""
            }`}
            key={`${place.latitude}-${place.longitude}`}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              onSelect(place);
            }}
          >
            <Icon name="search" size={18} />
            {place.label}
          </button>
        ))
      ) : (
        <Text tone="muted" size="sm" className="px-3 py-2">
          {t("step.noResults")}
        </Text>
      )}
    </div>
  );
}
