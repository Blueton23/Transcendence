import { getSegments } from "@/features/step/api/segmentApi";
import { CurrentTripCard } from "@/features/travel/components/CurrentTripCard";
import { TravelList } from "@/features/travel/components/TravelList";
import { useTravels } from "@/features/travel/hooks/useTravel";
import { getNextTravel } from "@/features/travel/utils/getNextTravel";
import Button from "@/shared/ui/Button";
import Card from "@/shared/ui/Card";
import Heading from "@/shared/ui/Heading";
import Icon from "@/shared/ui/Icon";

function TravelPage() {
  const { travels } = useTravels();

  const nextTravel = getNextTravel(travels);

  const segments = getSegments();

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 p-4">
      <div className="flex">
        <Heading>Mes Voyages</Heading>
        <Button variant="primary" icon={<Icon name="plus" size={18} />}>
          Nouveau voyage
        </Button>
      </div>
      {nextTravel && (
        <CurrentTripCard travel={nextTravel} segments={segments} />
      )}
      <Card variant="default">
        Notification, je sais pas encore comment ca doit etre connecte
      </Card>
      <div className="flex flex-row">
        <TravelList travels={travels} />
      </div>
    </div>
  );
}
export default TravelPage;
