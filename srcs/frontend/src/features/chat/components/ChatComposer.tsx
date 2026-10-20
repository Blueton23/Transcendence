import { useRef, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";

import Button from "@/shared/ui/Button";
import Text from "@/shared/ui/Text";
import Icon from "@/shared/ui/Icon";

interface ChatComposerProps {
  onSend: (body: string) => Promise<void>;
}

export default function ChatComposer({ onSend }: ChatComposerProps) {
  const [body, setBody] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const content = body.trim();
    if (!content || isSending) return;

    setIsSending(true);
    setError(null);

    try {
      await onSend(content);
      setBody("");

      // Conserver le focus pour écrire le message suivant.
      requestAnimationFrame(() => textareaRef.current?.focus());
    } catch (sendError) {
      setError(
        sendError instanceof Error
          ? sendError.message
          : "Impossible d'envoyer le message.",
      );
    } finally {
      setIsSending(false);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-border bg-surface p-4"
    >
      <div className="flex items-center gap-3">
        <textarea
          ref={textareaRef}
          id="chat-message"
          name="message"
          value={body}
          onChange={(event) => setBody(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Écrire un message…"
          maxLength={2000}
          disabled={isSending}
          aria-describedby={error ? "chat-message-error" : undefined}
          className="min-h-12 min-w-0 flex-1 resize-y rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text transition-colors outline-none placeholder:text-muted focus:border-brand-primary focus:ring-1 focus:ring-brand-primary disabled:cursor-not-allowed disabled:opacity-60"
        />

        <Button
          type="submit"
          variant="primary"
          disabled={!body.trim() || isSending}
        >
          <span className="inline-flex items-center gap-2">
            <Icon name="arrow" size={16} />
            {isSending ? "Envoi…" : "Envoyer"}
          </span>
        </Button>
      </div>

      {error && (
        <div id="chat-message-error" role="alert" className="mt-2">
          <Text tone="accent" size="sm">
            {error}
          </Text>
        </div>
      )}
    </form>
  );
}
