import type { Idea } from "@/features/idea/types";
import { VoteButton } from "@/features/idea/components/card/VoteButton";
import { StepButton } from "@/features/idea/components/card/StepButton";
import { SecondaryInfo } from "@/features/idea/components/card/SecondaryInfo";
import { StepLabel } from "@/features/idea/components/card/StepLabel";
import { IdeaOptionsMenu } from "@/features/idea/components/card/IdeaOptionsMenu";
import { ideaIcons } from "@/features/idea/utils/ideaIcons";
import { useSubmitAction } from "@/shared/hooks/useSubmitAction";
import Text from "@/shared/ui/Text";
import IconBadge from "@/shared/ui/IconBadge";
import Card from "@/shared/ui/Card";
import Heading from "@/shared/ui/Heading";

// Défini les composant d'entrée
export interface IdeaCardProps {
  idea: Idea;
  proposerName: string;
  proposerInitials: string;
  voteCount: number;
  voted: boolean;
  stepName?: string;
  onPlace: () => void;
  onView: () => void;
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
  voteCount,
  voted,
  stepName,
  onPlace,
  onView,
  onVote,
  onEdit,
  onDelete,
  onChoose,
}: IdeaCardProps) {
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

  const isActionPending = isDeleting || isChoosing || isVoting;

  return (
    <Card>
      <div className="flex md:items-center md:justify-between">
        <div className="flex min-w-0 flex-1 items-start gap-2 md:items-center md:gap-3">
          <IconBadge name={ideaIcons[idea.type]} size="md" />

          <div className="flex min-w-0 flex-1 flex-col">
            <Heading level={3} size="xs" className="truncate">
              {idea.title}
            </Heading>

            <div className="flex min-w-0 flex-col items-start gap-1 md:flex-row md:items-center md:gap-1.5">
              <SecondaryInfo
                ideaType={idea.type}
                pricePerNight={idea.pricePerNight}
                proposerName={proposerName}
                proposerInitials={proposerInitials}
              />
              <StepLabel isInPool={isInPool} stepName={stepName} />
              {idea.type === "accommodation" && idea.status === "chosen" && (
                <Text size="sm">Hébergement choisi</Text>
              )}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 whitespace-nowrap md:flex-nowrap md:gap-3">
          <div className="order-1">
            <VoteButton
              voteCount={voteCount}
              voted={voted}
              disabled={isActionPending}
              onVote={() => {
                if (isActionPending) {
                  return;
                }

                void submitVote();
              }}
            />
          </div>

          <div className="order-2 md:order-3">
            {isActionPending ? (
              <div role="status">
                <Text size="sm">
                  {isDeleting
                    ? "Suppression…"
                    : isChoosing
                      ? "Choix en cours…"
                      : "Vote en cours…"}
                </Text>
              </div>
            ) : (
              <IdeaOptionsMenu
                onEdit={onEdit}
                onDelete={() => {
                  if (isActionPending) {
                    return;
                  }

                  void submitDelete();
                }}
                onChoose={
                  canChoose
                    ? () => {
                        if (isActionPending) {
                          return;
                        }

                        void submitChoose();
                      }
                    : undefined
                }
              />
            )}
          </div>

          <div className="order-3 flex basis-full justify-end md:order-2 md:basis-auto">
            <StepButton
              isInPool={isInPool}
              onPlace={onPlace}
              onView={onView}
              disabled={isActionPending}
            />
          </div>
        </div>
      </div>
      {deleteError && (
        <div role="alert" className="mt-2">
          <Text tone="accent" size="sm" className="whitespace-pre-line">
            {deleteError}
          </Text>
        </div>
      )}
      {chooseError && (
        <div role="alert" className="mt-2">
          <Text tone="accent" size="sm" className="whitespace-pre-line">
            {chooseError}
          </Text>
        </div>
      )}
      {voteError && (
        <div role="alert" className="mt-2">
          <Text tone="accent" size="sm" className="whitespace-pre-line">
            {voteError}
          </Text>
        </div>
      )}
    </Card>
  );
}

/*
Fonction qui gère l'ensemble d'une carte d'idée
*/
