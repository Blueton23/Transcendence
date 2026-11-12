import type { Idea } from "@/features/idea/types";
import { VoteButton } from "@/features/idea/components/card/VoteButton";
import { StepButton } from "@/features/idea/components/card/StepButton";
import { SecondaryInfo } from "@/features/idea/components/card/SecondaryInfo";
import { StepLabel } from "@/features/idea/components/card/StepLabel";
import { useSubmitAction } from "@/shared/hooks/useSubmitAction";
import Text from "@/shared/ui/Text";
import Card from "@/shared/ui/Card";
import Heading from "@/shared/ui/Heading";
import Button from "@/shared/ui/Button";
import { useTranslation } from "react-i18next";
import { OptionsMenu } from "@/shared/ui/OptionsMenu";
import type { AvatarColor } from "@/shared/ui/Avatar";
import { ideaTypeLabels } from "@/features/idea/utils/ideaTypeLabels";
import { ideaBands } from "@/features/idea/utils/ideaBands";
import Divider from "@/shared/ui/Divider";
import Icon from "@/shared/ui/Icon";

// Défini les composant d'entrée
export interface IdeaCardProps {
  idea: Idea;
  proposerName: string;
  proposerInitials: string;
  stepName?: string;
  chooseButton?: boolean;
  color: AvatarColor;
  onPlace?: () => void;
  onView?: () => void;
  onVote: () => Promise<void>;
  onEdit: () => void;
  onDelete: () => Promise<void>;
  onChoose: () => Promise<void>;
}

/*----------------------------------------------------------------------------------*/

// Fonction principale pour une seule carte d'idée
export function IdeaCard({
  idea,
  proposerName,
  proposerInitials,
  color,
  stepName,
  chooseButton,
  onPlace,
  onView,
  onVote,
  onEdit,
  onDelete,
  onChoose,
}: IdeaCardProps) {
  const { t } = useTranslation();
  const isInPool = idea.status === "suggested";

  const {
    submit: submitDelete,
    isSubmitting: isDeleting,
    error: deleteError,
  } = useSubmitAction(onDelete);

  const {
    submit: submitChoose,
    isSubmitting: isChoosing,
    error: chooseError,
  } = useSubmitAction(onChoose);

  const {
    submit: submitVote,
    isSubmitting: isVoting,
    error: voteError,
  } = useSubmitAction(onVote);

  const canChoose = idea.type === "accommodation" && idea.status === "placed";
  const isLodging = idea.type === "accommodation";
  const isChosen = isLodging && idea.status === "chosen";

  const isActionPending = isDeleting || isChoosing || isVoting;

  return (
    <Card
      band={
        <>
          <span className="flex items-center gap-1 text-sm font-semibold">
            {isChosen && <Icon name="check" size={14} />}
            {isChosen ? t("idea.chosenLodging") : t(ideaTypeLabels[idea.type])}
          </span>
          <div className="ml-auto flex items-center gap-1">
            <VoteButton
              voteCount={idea.voteCount}
              voted={idea.voted}
              disabled={isActionPending}
              onVote={() => {
                if (isActionPending) {
                  return;
                }

                void submitVote();
              }}
              ideaCard
            />
            <OptionsMenu
              disabled={isActionPending}
              variant="ghost"
              onEdit={onEdit}
              onDelete={() => void submitDelete()}
              extraActions={
                canChoose && !chooseButton
                  ? [
                      {
                        icon: "check",
                        label: t("idea.chooseLodging"),
                        onClick: () => void submitChoose(),
                      },
                    ]
                  : []
              }
            />
          </div>
        </>
      }
      bandClassName={ideaBands[idea.type]}
      className="flex flex-col gap-3"
    >
      <div className="flex items-start justify-between gap-5">
        <div className="flex min-w-0 flex-col">
          <Heading level={3} size="sm" className="truncate">
            {idea.title}
          </Heading>
          <SecondaryInfo
            proposerName={proposerName}
            proposerInitials={proposerInitials}
            color={color}
          />
        </div>
        {idea.pricePerNight && (
          <div className="flex shrink-0 flex-col items-end">
            <Text size="lg" font="mono" className="font-semibold">
              {idea.pricePerNight} CHF
            </Text>
            <Text size="sm" tone="muted">
              {t("units.perNight")}
            </Text>
          </div>
        )}
      </div>
      <Divider />
      <div className="flex flex-wrap items-center justify-between gap-2">
        {(isInPool || stepName) && (
          <StepLabel
            isInPool={isInPool}
            stepName={stepName}
            startDate={isLodging ? idea.arrivalDate : idea.date}
            endDate={isLodging ? idea.departureDate : null}
          />
        )}
        <div className="ml-auto">
          {chooseButton ? (
            <Button
              variant="dark"
              size="xs"
              onClick={() => submitChoose()}
              disabled={isActionPending}
            >
              {t("idea.choose")}
            </Button>
          ) : (
            (onPlace || onView) && (
              <StepButton
                isInPool={isInPool}
                onPlace={onPlace}
                onView={onView}
                disabled={isActionPending}
              />
            )
          )}
        </div>
      </div>

      {[deleteError, chooseError, voteError].map(
        (error) =>
          error && (
            <div key={error} role="alert">
              <Text tone="accent" size="sm" className="whitespace-pre-line">
                {error}
              </Text>
            </div>
          ),
      )}
    </Card>
  );
}
