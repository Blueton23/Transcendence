import { SecondaryInfo } from "@/features/idea/components/card/SecondaryInfo";
import { useSubmitAction } from "@/shared/hooks/useSubmitAction";
import Text from "@/shared/ui/Text";
import IconBadge from "@/shared/ui/IconBadge";
import Card from "@/shared/ui/Card";
import Heading from "@/shared/ui/Heading";
import { useTranslation } from "react-i18next";
import type { Spending } from "@/features/spending/types";
import Tag from "@/shared/ui/Tag";
import { OptionsMenu } from "@/shared/ui/OptionsMenu";
import { spendingCategoryIcons } from "@/features/spending/utils/spendingCategoryIcons";
import { spendingCategoryLabels } from "@/features/spending/utils/spendingCategoryLabels";

export interface SpendingCardProps {
  spending: Spending;
  payer: { name: string; initials: string };
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
      <div className="flex md:items-center md:justify-between">
        <div className="flex min-w-0 flex-1 items-start gap-2 md:items-center md:gap-3">
          <IconBadge
            name={spendingCategoryIcons[spending.category]}
            size="md"
          />

          <div className="flex min-w-0 flex-1 flex-col">
            <Heading level={3} size="xs" className="truncate">
              {spending.label || t(spendingCategoryLabels[spending.category])}
            </Heading>

            <div className="flex min-w-0 flex-col items-start gap-1 md:flex-row md:items-center md:gap-1.5">
              <SecondaryInfo
                proposerName={payer.name}
                proposerInitials={payer.initials}
              />
              <Tag tone="muted" className="truncate">
                {stepName ? `→ ${stepName}` : t("spending.wholeTravel")}
              </Tag>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 whitespace-nowrap md:flex-nowrap md:gap-3">
          <Text className="font-bold">{`${spending.amount} CHF`}</Text>
          <div className="order-2 md:order-3">
            <OptionsMenu
              disabled={isDeleting}
              onEdit={onEdit}
              onDelete={() => void submitDelete()}
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
    </Card>
  );
}

/*
Fonction qui gère l'ensemble d'une carte d'idée
*/
