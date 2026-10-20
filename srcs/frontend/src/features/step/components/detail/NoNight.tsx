import Button from "@/shared/ui/Button";
import Card from "@/shared/ui/Card";
import Text from "@/shared/ui/Text";

export function NoNight({
  onAddLodging,
}: {
  onAddLodging: () => void;
}) {
  return (
    <Card variant="dashed" className="flex items-center justify-between p-2!">
      <Text tone="muted">Aucun hebergement n'est encore prévu</Text>
      <Button variant="outline" size="sm" onClick={onAddLodging}>
        + Proposer
      </Button>
    </Card>
  );
}
