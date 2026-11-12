import { useRef, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";

import Text from "@/shared/ui/Text";
import Icon from "@/shared/ui/Icon";
import { useTranslation } from "react-i18next";
import IconButton from "@/shared/ui/IconButton";

interface ChatComposerProps {
  onSend: (body: string) => Promise<void>;
}

export default function ChatComposer({ onSend }: ChatComposerProps) {
  const [body, setBody] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

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
    } catch (err) {
      setError(err instanceof Error ? err.message : null);
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
    <form onSubmit={handleSubmit} className="px-4 pt-2 pb-4 md:px-5">
      <div className="flex items-end gap-2 rounded-xl border border-border bg-surface py-1.5 pr-1.5 pl-4 shadow-sm focus-within:border-brand-primary">
        <textarea
          ref={textareaRef}
          id="chat-message"
          name="message"
          value={body}
          onChange={(event) => setBody(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t("chat.placeholder")}
          maxLength={2000}
          disabled={isSending}
          aria-describedby={error ? "chat-message-error" : undefined}
          rows={1}
          className="field-sizing-content max-h-40 min-w-0 flex-1 resize-none rounded-lg py-2 text-sm text-text outline-none placeholder:text-muted disabled:opacity-60"
        />

        <IconButton
          type="submit"
          variant="primary"
          size="md"
          label={isSending ? t("chat.sending") : t("chat.send")}
          icon={<Icon name="arrow" size={16} />}
          disabled={!body.trim() || isSending}
        />
      </div>

      {error && (
        <div id="chat-message-error" role="alert" className="mt-2">
          <Text tone="accent" size="sm" className="whitespace-pre-line">
            {error}
          </Text>
        </div>
      )}
    </form>
  );
}
