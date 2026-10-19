
import { useState } from "react";
import Button from "../../../shared/ui/Button";
import Text from "../../../shared/ui/Text";

interface ChatComposerProps {
  onSend: (body: string) => Promise<void>;
}

export default function ChatComposer({ onSend }: ChatComposerProps) {
  const [body, setBody] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const content = body.trim();
    if (!content || isSending) return;

    setIsSending(true);
    setError(null);

    try {
      await onSend(content);
      setBody("");
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

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-end gap-3 border-t border-border bg-surface p-4"
    >
      <div className="flex-1">
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              event.currentTarget.form?.requestSubmit();
            }
          }}
          placeholder="Écrire un message…"
          aria-label="Message à envoyer"
          rows={2}
          maxLength={2000}
          className="min-h-12 w-full resize-y rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-brand-primary"
        />

        {error && (
          <Text tone="accent" size="sm" className="mt-1">
            {error}
          </Text>
        )}
      </div>

      <Button
        type="submit"
        disabled={!body.trim() || isSending}
      >
        {isSending ? "Envoi…" : "Envoyer"}
      </Button>
    </form>
  );
}
