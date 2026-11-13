import type { Idea } from "@/features/idea/types";
import { lodgingInfo } from "@/features/idea/utils/lodgingInfo";
import type { IdeaActions } from "@/features/step/types";
import { useSubmitAction } from "@/shared/hooks/useSubmitAction";
import Card from "@/shared/ui/Card";
import Heading from "@/shared/ui/Heading";
import Icon from "@/shared/ui/Icon";
import { OptionsMenu } from "@/shared/ui/OptionsMenu";
import Text from "@/shared/ui/Text";

interface ChosenNightProps {
  night: Idea;
  actions: IdeaActions;
}

export function ChosenNight({ night, actions }: ChosenNightProps) {
  const remove = useSubmitAction(() => actions.onDelete(night.id));
  return (
    <div className="flex flex-col gap-1">
      <Card
        variant="accommodation"
        className="flex min-w-0 flex-1 items-start justify-between md:items-center"
      >
        <div className="flex flex-1 items-center gap-2 md:gap-3">
          <Icon name="tent" />
          <div className="flex flex-col">
            <Heading size="xs">{night.title}</Heading>
            <div className="flex flex-1">
              <Text font="sans">{lodgingInfo(night)}</Text>
            </div>
          </div>
        </div>
        <OptionsMenu
          onDelete={() => remove.submit()}
          onEdit={() => actions.onEdit(night.id)}
          variant="ghost"
        />
      </Card>
      {remove.error && (
        <div role="alert" className="px-3">
          <Text tone="accent" size="sm" className="whitespace-pre-line">
            {remove.error}
          </Text>
        </div>
      )}
    </div>
  );
}
