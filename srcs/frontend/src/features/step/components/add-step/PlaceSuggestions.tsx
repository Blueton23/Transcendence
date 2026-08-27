import Icon from "../../../../shared/ui/Icon";
import Text from "../../../../shared/ui/Text";

interface PlaceSuggestionsProps {
  items: string[];
  onSelect: (lieu: string) => void;
}

export function PlaceSuggestions({ items, onSelect }: PlaceSuggestionsProps) {
  return (
    <div className="absolute z-10 mt-2 flex w-full flex-col rounded-md bg-surface py-2">
      {items.length > 0 ? (
        items.map((lieu) => (
          <button
            type="button"
            className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm text-muted hover:bg-surface-raised"
            key={lieu}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              onSelect(lieu);
            }}
          >
            <Icon name="search" size={18} />
            {lieu}
          </button>
        ))
      ) : (
        <Text tone="muted" size="sm" className="px-3 py-2">
          Aucun résultat
        </Text>
      )}
    </div>
  );
}
