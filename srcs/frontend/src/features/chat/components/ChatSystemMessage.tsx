import Badge from "@/shared/ui/Badge";

interface ChatSystemMessageProps {
  body: string;
}

export default function ChatSystemMessage({ body }: ChatSystemMessageProps) {
  return (
    <div className="flex justify-center py-2">
      <Badge variant="error">Info : {body}</Badge>
    </div>
  );
}
