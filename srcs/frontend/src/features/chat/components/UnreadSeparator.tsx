import Text from "../../../shared/ui/Text";

export default function UnreadSeparator() {
  return (
    <div className="flex items-center gap-3 py-4" aria-label="Messages non lus">
      <div className="h-px flex-1 bg-brand-primary" />
      <Text size="sm" tone="accent">
        Non lu
      </Text>
      <div className="h-px flex-1 bg-brand-primary" />
    </div>
  );
}