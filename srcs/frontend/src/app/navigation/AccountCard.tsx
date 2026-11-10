import { useAuth } from "@/features/auth/context/useAuth";
import { useSubmitAction } from "@/shared/hooks/useSubmitAction";
import Avatar from "@/shared/ui/Avatar";
import Card from "@/shared/ui/Card";
import Icon from "@/shared/ui/Icon";
import IconButton from "@/shared/ui/IconButton";
import Text from "@/shared/ui/Text";
import { useTranslation } from "react-i18next";

export function AccountCard() {
  const { t } = useTranslation();
  const { currentUser, logout } = useAuth();
  const { submit, isSubmitting } = useSubmitAction(logout);

  if (!currentUser) return null;

  return (
    <Card className="flex items-center gap-2.5 p-1.5! pl-2.5!">
      <Avatar />
      <Text className="min-w-0 flex-1 truncate font-semibold">
        {currentUser.username}
      </Text>
      <IconButton
        variant="ghost"
        label={t("auth.logout")}
        title={t("auth.logout")}
        icon={<Icon name="logout" />}
        onClick={submit}
        disabled={isSubmitting}
        className="text-error!"
      />
    </Card>
  );
}
