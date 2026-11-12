import { SecondaryInfo } from "@/features/idea/components/card/SecondaryInfo";
import { useSubmitAction } from "@/shared/hooks/useSubmitAction";
import Text from "@/shared/ui/Text";
import Card from "@/shared/ui/Card";
import Heading from "@/shared/ui/Heading";
import { useTranslation } from "react-i18next";
import type { Spending } from "@/features/spending/types";
import Tag from "@/shared/ui/Tag";
import { OptionsMenu } from "@/shared/ui/OptionsMenu";
import { spendingCategoryLabels } from "@/features/spending/utils/spendingCategoryLabels";
import type { AvatarColor } from "@/shared/ui/Avatar";
import { spendingCategoryBands } from "@/features/spending/utils/spendingCategoryBands";

export interface SpendingCardProps {
  spending: Spending;
  payer: { name: string; initials: string; color: AvatarColor };
  stepName?: string;
  onEdit: () => void;
  onDelete: () => Promise<void>;
}

export function SpendingCard({
  spending,
  payer,
  stepName,
  onEdit,
  onDelete,
}: SpendingCardProps) {
  const { t } = useTranslation();

  const {
    submit: submitDelete,
    isSubmitting: isDeleting,
    error: deleteError,
  } = useSubmitAction(onDelete);

  return (
    <Card>
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 flex-1 flex-col items-start gap-1 md:flex-row md:items-center md:gap-3">
          <Tag
            tone="plain"
            shape="soft"
            className={`shrink-0 md:w-30 md:justify-start ${spendingCategoryBands[spending.category]}`}
          >
            {t(spendingCategoryLabels[spending.category])}
          </Tag>
          <div className="flex min-w-0 flex-1 flex-col">
            <Heading level={3} size="sm" className="truncate">
              {spending.label || t(spendingCategoryLabels[spending.category])}
            </Heading>

            <div className="flex min-w-0 items-center gap-1 md:gap-1.5">
              <SecondaryInfo
                proposerName={payer.name}
                proposerInitials={payer.initials}
                color={payer.color as AvatarColor}
              />
              <Text tone="muted" size="sm" className="truncate">
                {"· "}
                {stepName ?? t("spending.wholeTravel")}
              </Text>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1 whitespace-nowrap">
          <Text size="lg" font="mono" className="font-semibold">
            {`${spending.amount} CHF`}
          </Text>
          <OptionsMenu
            variant="ghost"
            disabled={isDeleting}
            onEdit={onEdit}
            onDelete={() => void submitDelete()}
          />
        </div>
      </div>
      {deleteError && (
        <div role="alert" className="mt-2">
          <Text tone="accent" size="sm" className="whitespace-pre-line">
            {deleteError}
          </Text>
        </div>
      )}
    </Card>
  );
}
