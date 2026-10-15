import { useRoute } from "@/features/map/hooks/useRoute";
import { useSteps } from "@/features/step/hooks/useSteps";
import { CurrentTripCard } from "@/features/travel/components/CurrentTripCard";
import { NewTravelModal } from "@/features/travel/components/modal/NewTravelModal";
import { TravelList } from "@/features/travel/components/TravelList";
import { useTravels } from "@/features/travel/hooks/useTravel";
import { getNextTravel } from "@/features/travel/utils/getNextTravel";
import Button from "@/shared/ui/Button";
import Card from "@/shared/ui/Card";
import Heading from "@/shared/ui/Heading";
import Icon from "@/shared/ui/Icon";
import Text from "@/shared/ui/Text";
import { useState } from "react";

function TravelPage() {
  const { travels, isLoading, error, refetch } = useTravels();
  const nextTravel = isLoading || error ? undefined : getNextTravel(travels);
  const [newTravelOpen, setNewTravelOpen] = useState(false);
  const { steps } = useSteps(nextTravel?.id ?? 0);
  const { route } = useRoute(steps);
  if (isLoading) return null;
  if (error)
    return (
      <Text tone="accent" className="p-4">
        {error}
      </Text>
    );

  return (
    <div className="flex flex-col gap-4 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <Heading size="lg">Mes Voyages</Heading>
        <Button
          variant="primary"
          icon={<Icon name="plus" size={18} />}
          onClick={() => setNewTravelOpen(true)}
        >
          Nouveau voyage
        </Button>
      </div>
      {nextTravel && <CurrentTripCard travel={nextTravel} route={route} />}
      <Card variant="default">
        Notification: je sais pas encore comment ca sera connecte
      </Card>
      <TravelList
        travels={travels.filter((t) => t.id !== nextTravel?.id)}
        onAdd={() => setNewTravelOpen(true)}
      />
      {newTravelOpen && (
        <NewTravelModal
          onClose={() => setNewTravelOpen(false)}
          refetch={refetch}
        />
      )}
    </div>
  );
}
export default TravelPage;
