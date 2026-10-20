import { useParams } from "react-router";

import ChatHeader from "@/features/chat/components/ChatHeader";
import ChatTimeline from "@/features/chat/components/ChatTimeline";
import ChatComposer from "@/features/chat/components/ChatComposer";
import { useChat } from "@/features/chat/hooks/useChat";
import Text from "@/shared/ui/Text";

export default function ChatPage() {
  const { id } = useParams<{ id: string }>();
  const parsedId = Number(id);
  const isValidId = Boolean(id) && Number.isInteger(parsedId) && parsedId > 0;

  const { messages, unreadCount, isLoading, error, sendMessage } = useChat(
    isValidId ? parsedId : 0,
  );

  if (!isValidId) {
    return (
      <div className="p-5">
        <Text tone="accent">Identifiant de voyage invalide.</Text>
      </div>
    );
  }

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden bg-surface">
      <ChatHeader unreadCount={unreadCount} />

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4">
        <ChatTimeline messages={messages} isLoading={isLoading} error={error} />
      </div>

      <ChatComposer onSend={sendMessage} />
    </section>
  );
}
