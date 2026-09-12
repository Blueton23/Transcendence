import type { Idea } from "@/features/idea/types";
import { VoteButton } from "@/features/idea/components/card/VoteButton";
import { StepButton } from "@/features/idea/components/card/StepButton";
import { SecondaryInfo } from "@/features/idea/components/card/SecondaryInfo";
import { StepLabel } from "@/features/idea/components/card/StepLabel";
import { IdeaOptionsMenu } from "@/features/idea/components/card/IdeaOptionsMenu";
import { ideaIcons } from "@/features/idea/utils/ideaIcons";
import Card from "@/shared/ui/Card";
import Icon from "@/shared/ui/Icon";
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
  onVote: () => void;
  onEdit: () => void;
  onDelete: () => void;
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
}: IdeaCardProps) {
  return (
    <Card>
      <div className="flex flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-1 items-start gap-2 sm:items-center sm:gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-error-bg sm:size-10">
            <Icon name={ideaIcons[idea.type]} />
          </div>

          <div className="flex min-w-0 flex-1 flex-col">
            <Heading
              level={3}
              size="sm"
              className="truncate !text-xs whitespace-nowrap sm:!text-sm"
            >
              {idea.title}
            </Heading>

            <div className="flex min-w-0 flex-col items-start gap-1 sm:flex-row sm:items-center sm:gap-1.5">
              <SecondaryInfo
                ideaType={idea.type}
                pricePerNight={idea.pricePerNight}
                proposerName={proposerName}
                proposerInitials={proposerInitials}
              />
              <StepLabel stepId={idea.stepId} stepName={stepName} />
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 whitespace-nowrap sm:flex-nowrap sm:gap-3">
          <div className="order-1">
            <VoteButton voteCount={voteCount} voted={voted} onVote={onVote} />
          </div>

          <div className="order-2 sm:order-3">
            <IdeaOptionsMenu onEdit={onEdit} onDelete={onDelete} />
          </div>

          <div className="order-3 flex basis-full justify-end sm:order-2 sm:basis-auto">
            <StepButton
              stepId={idea.stepId}
              onPlace={onPlace}
              onView={onView}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}

/*
Fonction qui gère l'ensemble d'une carte d'idée
*/
