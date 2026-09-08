import Heading from "@/shared/ui/Heading";
import Card from "@/shared/ui/Card";
import Text from "@/shared/ui/Text";

//TODO(branchement): besoin de Idea pour pouvoir connecter ideas={ideas} et faire la logique des hebergements
//
export function AccommodationSection() {
  return (
    <div className="flex flex-col gap-2">
      <Heading size="sm">Hébergement</Heading>
      <Card variant="default">
        <Text tone="muted">Hébergement — à définir</Text>
      </Card>
    </div>
  );
}
