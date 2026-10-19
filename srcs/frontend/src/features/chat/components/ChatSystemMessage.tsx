import Text from "../../../shared/ui/Text";

interface ChatSystemMessageProps {
  body: string;
}

export default function ChatSystemMessage({ body }: ChatSystemMessageProps) {
  return (
    <div className="py-2 text-center">
      <Text size="sm" tone="muted">
        Info : {body}
      </Text>
    </div>
  );
}
