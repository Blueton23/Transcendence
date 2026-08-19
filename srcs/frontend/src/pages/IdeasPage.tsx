import { useIdeas } from "../features/idea/hooks/useIdeas";
import { IdeaCard } from "../features/idea/components/IdeaCard";

export function IdeasPage() {
  const ideas = useIdeas();

  return (
    <div>
      {ideas.map((idea) => (
        <IdeaCard key={idea.id}
        idea={idea}
        proposerName="David"
        proposerInitials="DL"
        voteCount={4}
        stepName="Montreux"
        pricePerNight={24}
        />
      ))}
    </div>
  );
}
