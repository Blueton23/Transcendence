import { useParams } from "react-router";
import { useTranslation } from "react-i18next";

import ChatHeader from "@/features/chat/components/ChatHeader";
import ChatTimeline from "@/features/chat/components/ChatTimeline";
import ChatComposer from "@/features/chat/components/ChatComposer";
import { useChat } from "@/features/chat/hooks/useChat";
import { useStickToBottom } from "@/features/chat/hooks/useStickToBottom";
import Text from "@/shared/ui/Text";
import { useTravel } from "@/features/travel/hooks/useTravel";
import { useTranslation } from "react-i18next";

export default function ChatPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const parsedId = Number(id);
  const isValidId =
    Boolean(id) && Number.isSafeInteger(parsedId) && parsedId > 0;

  if (!isValidId) {
    return (
      <div className="p-5" role="alert">
        <Text tone="accent">{t("errors.invalidTravelId")}</Text>
      </div>
    );
  }

  return <ValidChatPage travelId={parsedId} />;
}

function ValidChatPage({ travelId }: { travelId: number }) {
  const { messages, unreadCount, isLoading, error, sendMessage } =
    useChat(travelId);
  const { travel } = useTravel(travelId);
  const { containerRef, onScroll, stick } = useStickToBottom<HTMLDivElement>([
    messages,
    isLoading,
  ]);

  async function handleSend(body: string) {
    stick();
    await sendMessage(body);
  }

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden bg-surface">
      <ChatHeader unreadCount={unreadCount} />

      <div
        ref={containerRef}
        onScroll={onScroll}
        className="min-h-0 flex-1 overflow-y-auto px-5 pb-4"
      >
        <ChatTimeline
          messages={messages}
          isLoading={isLoading}
          error={error}
          travelers={travel?.travelers ?? []}
        />
      </div>

      <ChatComposer onSend={handleSend} />
    </section>
  );
}
