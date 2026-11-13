import { VoteButton } from "@/features/idea/components/card/VoteButton";
import type { Idea } from "@/features/idea/types";
import { getProposer } from "@/features/idea/utils/getProposer";
import { ideaIcons } from "@/features/idea/utils/ideaIcons";
import { ideaTypeLabels } from "@/features/idea/utils/ideaTypeLabels";
import type { IdeaActions } from "@/features/step/types";
import type { Travel } from "@/features/travel/types";
import Button from "@/shared/ui/Button";
import { OptionsMenu } from "@/shared/ui/OptionsMenu";
import Icon from "@/shared/ui/Icon";
import Tag from "@/shared/ui/Tag";
import Text from "@/shared/ui/Text";
import { useTranslation } from "react-i18next";
import { useSubmitAction } from "@/shared/hooks/useSubmitAction";
import {
  lodgingDates,
  lodgingDetails,
} from "@/features/idea/utils/lodgingInfo";

interface StepIdeaRowProps {
  idea: Idea;
  travel: Travel;
  actions: IdeaActions;
  chooseButton?: boolean;
}

export function StepIdeaRow({
  idea,
  travel,
  actions,
  chooseButton,
}: StepIdeaRowProps) {
  const { t } = useTranslation();
  const proposer = getProposer(travel, idea);

  const vote = useSubmitAction(() => actions.onVote(idea.id));
  const choose = useSubmitAction(() => actions.onChoose(idea.id));
  const remove = useSubmitAction(() => actions.onDelete(idea.id));

  const isPending =
    vote.isSubmitting || choose.isSubmitting || remove.isSubmitting;
  const error = vote.error ?? choose.error ?? remove.error;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between gap-3 rounded-md bg-surface px-2.5 py-1.5 shadow-sm md:px-3 md:py-2">
        <div className="flex min-w-0 flex-1 flex-row items-center gap-2 md:gap-3">
          {idea.type !== "accommodation" && (
            <Tag
              tone="idea"
              shape="soft"
              icon={<Icon name={ideaIcons[idea.type]} size={14} />}
            >
              {t(ideaTypeLabels[idea.type])}
            </Tag>
          )}
          <div className="flex min-w-0 flex-1 flex-col">
            <Text className="truncate font-semibold">{idea.title}</Text>
            {idea.type === "accommodation" ? (
              <>
                <Text size="sm" tone="muted" className="truncate">
                  {lodgingDetails(idea)}
                  <span className="hidden md:inline">
                    {" "}
                    · {lodgingDates(idea)}
                  </span>
                </Text>
                <Text size="sm" tone="muted" className="md:hidden">
                  {lodgingDates(idea)}
                </Text>
              </>
            ) : (
              <Text size="sm" tone="muted" className="truncate">
                {proposer.name}
              </Text>
            )}
          </div>
        </div>
        <div className="flex flex-row items-center gap-1.5 md:gap-3">
          <VoteButton
            voteCount={idea.voteCount}
            voted={idea.voted}
            disabled={isPending}
            onVote={() => void vote.submit()}
          />
          {chooseButton && (
            <Button
              size="xs"
              variant="dark"
              disabled={isPending}
              onClick={() => void choose.submit()}
            >
              {t("idea.choose")}
            </Button>
          )}
          <OptionsMenu
            onEdit={() => actions.onEdit(idea.id)}
            disabled={isPending}
            onDelete={() => void remove.submit()}
            variant="ghost"
          />
        </div>
      </div>
      {error && (
        <div role="alert" className="px-3">
          <Text tone="accent" size="sm" className="whitespace-pre-line">
            {error}
          </Text>
        </div>
      )}
    </div>
  );
}
