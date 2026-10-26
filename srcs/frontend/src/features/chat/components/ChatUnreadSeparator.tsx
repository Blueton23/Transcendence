import Divider from "@/shared/ui/Divider";
import Text from "@/shared/ui/Text";

export default function UnreadSeparator() {
  return (
    <div className="flex items-center gap-3 py-4" aria-label="Messages non lus">
      <div className="flex-1">
        <Divider className="bg-brand-primary" />
      </div>

      <Text size="sm" tone="accent">
        NON LU
      </Text>

      <div className="flex-1">
        <Divider className="bg-brand-primary" />
      </div>
    </div>
  );
}
