import { useState } from 'react';
import type { Idea, IdeaType } from '../features/idea/types';
import { useIdeas } from "../features/idea/hooks/useIdeas";
import { IdeaCard } from "../features/idea/components/IdeaCard";
import { PinIdeaButton } from "../features/idea/components/PinIdeaButton";
import Heading from "../shared/ui/Heading";
import Text from "../shared/ui/Text";
import Chip from "../shared/ui/Chip";
import Icon from "../shared/ui/Icon";

//A SUPPRIMER
const mockSteps = [
  { id: 1, name: "Montreux" },
  { id: 2, name: "Interlaken" },
  { id: 3, name: "Zermatt" },
];

type IdeaFilter = "all" | IdeaType;

function filterIdeas(ideas: Idea[], activeFilter: IdeaFilter) {
  if (activeFilter === "all") {
    return ideas;
  }

  return ideas.filter((idea) => idea.type === activeFilter);
}

type StepFilter = "all" | "none" | number;



export function IdeasPage() {
  const ideas = useIdeas();

  const [activeFilter, setActiveFilter] = useState<IdeaFilter>("all");
  const filteredIdeas = filterIdeas(ideas, activeFilter);

  const [stepActiveFilter, setStepActiveFilter] = useState<StepFilter>("all");



  return (
    <div className="px-8 pt-8">
      <div className="mb-6 flex items-center justify-between">
        <Heading level={1} size="lg">
          Idées
        </Heading>
        <PinIdeaButton/>
      </div>

      <div>
        <Text tone="muted" className="mb-1">
          Type
        </Text>
          <div className="mb-8 flex flex-wrap gap-2">
            <Chip active={activeFilter === "all"} onClick={() => setActiveFilter("all")}>
              Tous
            </Chip>

            <Chip active={activeFilter === "restaurant"} onClick={() => setActiveFilter("restaurant")}>
              <Icon name="fork" size={18}/>
              Restaurant
            </Chip>

            <Chip active={activeFilter === "accommodation"} onClick={() => setActiveFilter("accommodation")}>
              <Icon name="bed" size={18}/>
              Hébérgement
            </Chip>

            <Chip active={activeFilter === "activity"} onClick={() => setActiveFilter("activity")}>
              <Icon name="mtn" size={18}/>
              Activité
            </Chip>

            <Chip active={activeFilter === "sightseeing"} onClick={() => setActiveFilter("sightseeing")}>
              <Icon name="pin" size={18}/>
              A voir
            </Chip>
          </div>
      </div>

      <div>
        <Text tone="muted" className="mb-1">
          Etape
        </Text>
          <div className="mb-8 flex flex-wrap gap-2">
            <Chip active={activeFilter === "all"} onClick={() => setActiveFilter("all")}>
              Toutes
            </Chip>
          </div>
      </div>







      {filteredIdeas.map((idea) => (
        <IdeaCard key={idea.id}
        idea={idea}
        proposerName="David"
        proposerInitials="DL"
        voteCount={4}
        stepName="Montreux"
        />
      ))}
    </div>
  );
}

/*
className="px-8 pt-8" espace en haut



pr-8  → padding-right
pl-8  → padding-left
px-8  → padding gauche + droite

mr-8  → margin-right
ml-8  → margin-left
mx-8  → margin gauche + droite
mb-8  en dessous
*/