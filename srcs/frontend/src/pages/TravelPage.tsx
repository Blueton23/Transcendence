import { useRoute } from "@/features/map/hooks/useRoute";
import { useSteps } from "@/features/step/hooks/useSteps";
import { CurrentTripCard } from "@/features/travel/components/CurrentTripCard";
import { NewTravelModal } from "@/features/travel/components/modal/NewTravelModal";
import { TravelList } from "@/features/travel/components/TravelList";
import { NotificationsCard } from "@/features/notifications/components/NotificationsCard";
import { useTravels } from "@/features/travel/hooks/useTravel";
import { useTravelNotifications } from "@/features/travel/hooks/useTravelNotifications";
import { useFriendRequests } from "@/features/friendship/hooks/useFriendRequests";
import { getNextTravel } from "@/features/travel/utils/getNextTravel";
import Button from "@/shared/ui/Button";
import Heading from "@/shared/ui/Heading";
import Icon from "@/shared/ui/Icon";
import Text from "@/shared/ui/Text";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useInvitationNotifications } from "@/features/travel/hooks/useInvitationNotifications";
import { toApiDateString } from "@/shared/utils/dates";
import { FinishedTravelList } from "@/features/travel/components/FinishedTravelList";
import Card from "@/shared/ui/Card";

function TravelPage() {
  const { travels, isLoading, error, refetch } = useTravels();
  const { notifications: travelNotifications, error: notificationsError } =
    useTravelNotifications();
  const friendRequests = useFriendRequests();
  const {
    notifications: invitationNotifications,
    error: InvitationNotificationsError,
  } = useInvitationNotifications();
  const nextTravel = isLoading || error ? undefined : getNextTravel(travels);
  const [newTravelOpen, setNewTravelOpen] = useState(false);
  const { steps } = useSteps(nextTravel?.id ?? 0);
  const { route } = useRoute(steps);
  const { t } = useTranslation();
  if (isLoading) return null;
  if (error)
    return (
      <Text tone="accent" className="p-4">
        {error}
      </Text>
    );

  const today = toApiDateString(new Date());
  const others = travels.filter((travel) => travel.id !== nextTravel?.id);
  const upcoming = others.filter((travel) => travel.endDate >= today);
  const finished = others.filter((travel) => travel.endDate < today);

  return (
    <div className="flex flex-col gap-4 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <Heading size="xl">{t("nav.trips")}</Heading>
        <Button
          variant="primary"
          icon={<Icon name="plus" size={18} />}
          onClick={() => setNewTravelOpen(true)}
        >
          {t("travel.newTravel")}
        </Button>
      </div>
      <div
        className={`grid grid-cols-1 gap-4 ${nextTravel ? "md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]" : ""}`}
      >
        {nextTravel && <CurrentTripCard travel={nextTravel} route={route} />}
        <NotificationsCard
          travels={travelNotifications}
          travelsError={notificationsError}
          friendRequests={friendRequests}
          invitations={invitationNotifications}
          invitationsError={InvitationNotificationsError}
        />
      </div>
      {upcoming.length > 0 && (
        <Heading size="sm">{t("travel.upcoming")}</Heading>
      )}
      <TravelList travels={upcoming} onChange={refetch} />

      {finished.length > 0 && (
        <>
          <Heading size="sm" className="text-text-secondary!">
            {t("travel.finished")}
          </Heading>
          <FinishedTravelList travels={finished} onChange={refetch} />
        </>
      )}
      {newTravelOpen && (
        <NewTravelModal
          onClose={() => setNewTravelOpen(false)}
          refetch={refetch}
        />
      )}
      {travels.length === 0 && (
        <Card
          variant="dashed"
          interactive
          onClick={() => setNewTravelOpen(true)}
          className="flex flex-col items-center gap-2 py-10 text-center"
        >
          <Icon name="van" size={28} className="text-muted" />
          <Heading size="sm">{t("travel.emptyTitle")}</Heading>
          <Text tone="secondary">{t("travel.emptyText")}</Text>
        </Card>
      )}
    </div>
  );
}
export default TravelPage;
