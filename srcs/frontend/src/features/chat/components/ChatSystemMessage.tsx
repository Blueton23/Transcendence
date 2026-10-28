import Badge from "@/shared/ui/Badge";

interface ChatSystemMessageProps {
  body: string;
}
// @TODO peut être changer la couleur de l'info suivant le type de message, car la tout le temps rouge
export default function ChatSystemMessage({ body }: ChatSystemMessageProps) {
  return (
    <div className="flex justify-center py-2">
      <Badge variant="error">{body}</Badge>
    </div>
  );
}
