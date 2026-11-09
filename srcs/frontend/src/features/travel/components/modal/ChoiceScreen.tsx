import { getInvitation } from "@/features/travel/api/travelApi";
import { extractToken } from "@/features/travel/utils/extractToken";
import { useSubmitAction } from "@/shared/hooks/useSubmitAction";
import Button from "@/shared/ui/Button";
import Card from "@/shared/ui/Card";
import Divider from "@/shared/ui/Divider";
import Heading from "@/shared/ui/Heading";
import Icon from "@/shared/ui/Icon";
import IconBadge from "@/shared/ui/IconBadge";
import IconButton from "@/shared/ui/IconButton";
import Input from "@/shared/ui/Input";
import Text from "@/shared/ui/Text";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface ChoiceScreenProps {
  onCreate: () => void;
  onJoin: (token: string) => void;
}

export function ChoiceScreen({ onCreate, onJoin }: ChoiceScreenProps) {
  const [link, setLink] = useState("");
  const { t } = useTranslation();
  const { submit, isSubmitting, error } = useSubmitAction(async () => {
    const token = extractToken(link);
    if (!token) throw new Error(t("travel.errors.invalid_invitation_link"));
    await getInvitation(token);
    return token;
  });

  async function handleJoin() {
    const result = await submit();
    if (result.success && result.data) {
      onJoin(result.data);
    }
  }
  return (
    <div className="flex flex-col gap-5">
      <Card
        onClick={onCreate}
        className="flex cursor-pointer items-center justify-between"
      >
        <div className="flex items-center gap-5">
          <IconBadge name="compass" />
          <Heading size="sm">{t("travel.createTravel")}</Heading>
        </div>
        <IconButton
          variant="ghost"
          icon={<Icon name="arrow" />}
          label={t("actions.continue")}
        />
      </Card>
      <Divider />
      <Text>{t("travel.haveInviteLink")}</Text>
      <div className="flex flex-col gap-4 md:flex-row md:gap-2">
        <Input
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="peripl.app/join/…"
        ></Input>
        <Button
          variant="dark"
          onClick={() => void handleJoin()}
          disabled={isSubmitting}
        >
          {t("actions.continue")}
        </Button>
      </div>
      {error && <Text tone="accent">{error}</Text>}
    </div>
  );
}
