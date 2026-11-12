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

  return (
    <div className="flex items-center justify-between gap-3 rounded-md bg-surface px-3 py-2 shadow-sm">
      <div className="flex min-w-0 flex-1 flex-col gap-2 md:flex-row md:gap-3">
        {idea.type !== "accommodation" && (
          <Tag
            tone="idea"
            shape="soft"
            icon={<Icon name={ideaIcons[idea.type]} size={14} />}
            className="self-start md:self-center"
          >
            {t(ideaTypeLabels[idea.type])}
          </Tag>
        )}
        <div className="flex min-w-0 flex-1 flex-col">
          <Text className="truncate font-semibold">{idea.title}</Text>
          <Text size="sm" tone="muted" className="truncate">
            {proposer.name}
            {idea.pricePerNight !== null && (
              <>
                {" · "}
                <span className="font-mono font-semibold text-text">
                  {idea.pricePerNight} CHF
                </span>{" "}
                {t("units.perNight")}
              </>
            )}
          </Text>
        </div>
      </div>
      <div className="flex flex-row items-center gap-3">
        <VoteButton
          voteCount={idea.voteCount}
          voted={idea.voted}
          onVote={() => void actions.onVote(idea.id)}
        />
        {chooseButton && (
          <Button
            size="xs"
            variant="dark"
            onClick={() => void actions.onChoose(idea.id)}
          >
            {t("idea.choose")}
          </Button>
        )}
        <OptionsMenu
          onEdit={() => actions.onEdit(idea.id)}
          onDelete={() => void actions.onDelete(idea.id)}
          variant="ghost"
        />
      </div>
    </div>
  );
}
