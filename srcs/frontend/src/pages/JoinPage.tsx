import { joinTravel, refuseInvitation } from "@/features/travel/api/travelApi";
import { useInvitation } from "@/features/travel/hooks/useInvitation";
import { computeTravelDates } from "@/features/travel/utils/computeTravelDates";
import { useSubmitAction } from "@/shared/hooks/useSubmitAction";
import Avatar from "@/shared/ui/Avatar";
import Button from "@/shared/ui/Button";
import Card from "@/shared/ui/Card";
import Heading from "@/shared/ui/Heading";
import Icon from "@/shared/ui/Icon";
import IconBadge from "@/shared/ui/IconBadge";
import Tag from "@/shared/ui/Tag";
import Text from "@/shared/ui/Text";
import { getAvatarColor } from "@/shared/utils/getAvatarColors";
import { useTranslation } from "react-i18next";
import { Navigate, useNavigate, useParams } from "react-router";

function JoinPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { travel, isLoading, error } = useInvitation(token || "");
  const {
    submit,
    isSubmitting,
    error: joinError,
  } = useSubmitAction(() => joinTravel(token ?? ""));
  const {
    submit: submitRefuse,
    isSubmitting: isRefusing,
    error: refuseError,
  } = useSubmitAction(() => refuseInvitation(token ?? ""));
  if (isLoading) return null;
  if (error)
    return (
      <Text tone="accent" className="p-4">
        {error}
      </Text>
    );
  if (!travel) return null;
  if (travel.isMember) {
    return <Navigate to={`/travel/${travel.id}/itinerary`} replace />;
  }

  const handleJoin = async () => {
    const result = await submit();
    if (result.success && result.data) {
      navigate(`/travel/${result.data.id}/itinerary`);
    }
  };

  const handleRefuse = async () => {
    const result = await submitRefuse();
    if (result.success) {
      navigate(`/travel`);
    }
  };

  const DatesLabel = computeTravelDates(travel.startDate, travel.endDate);
  const visible = travel.travelers.slice(0, 3);
  const hidden = travel.travelers.length - visible.length;
  return (
    <div className="flex min-h-dvh items-center justify-center p-6">
      <Card className="w-full max-w-100 bg-surface-container p-10">
        <div className="flex flex-col items-center justify-center gap-3">
          <Text font="mono" tone="muted">
            {t("travel.invitation")}
          </Text>
          <IconBadge name="compass" color="brand"></IconBadge>
          <Heading>{travel.title}</Heading>
          <Tag>{DatesLabel}</Tag>
          <div className="flex -space-x-2">
            {visible.map((traveler) => (
              <Avatar
                key={traveler.id}
                className="ring-2 ring-surface-container"
                color={getAvatarColor(travel.travelers, traveler.id)}
              >
                {traveler.initials}
              </Avatar>
            ))}
          </div>
          {hidden > 0 && <Avatar>+{hidden}</Avatar>}
          <Button
            disabled={isSubmitting}
            variant="primary"
            icon={<Icon name="check" />}
            onClick={handleJoin}
          >
            {t("travel.joinTravel")}
          </Button>
          {travel.isInvited ? (
            <Button
              disabled={isRefusing || isSubmitting}
              variant="ghost"
              icon={<Icon name="x" />}
              onClick={handleRefuse}
              className="underline"
            >
              {t("travel.refuseInvitation")}
            </Button>
          ) : (
            <Button
              variant="ghost"
              className="underline"
              onClick={() => navigate("/travel")}
            >
              {t("travel.notNow")}
            </Button>
          )}
          <Text>
            {t("travel.travelersOnBoard", { count: travel.travelers.length })}
          </Text>
        </div>
        {(joinError || refuseError) && (
            <Text tone="accent" className="whitespace-pre-line">
              {joinError || refuseError}
            </Text>
        )}
      </Card>
    </div>
  );
}

export default JoinPage;
