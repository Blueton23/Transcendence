import { useTranslation } from "react-i18next";

import Badge from "@/shared/ui/Badge";

import type { ChatMessage } from "../types";

interface ChatSystemMessageProps {
  message: ChatMessage;
}
// @TODO peut être changer la couleur de l'info suivant le type de message, car la tout le temps rouge
export default function ChatSystemMessage({ message }: ChatSystemMessageProps) {
  const { t } = useTranslation();
  return (
    <div className="flex justify-center py-2">
      <Badge variant="error">
        {t(`chat.system.${message.systemKey}`, message.systemParams)}
      </Badge>
    </div>
  );
}
