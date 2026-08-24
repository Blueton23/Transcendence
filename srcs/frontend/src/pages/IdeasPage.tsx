import { useState } from "react";
import type { Idea, IdeaType } from "../features/idea/types";
import { useIdeas } from "../features/idea/hooks/useIdeas";
import { IdeaCard } from "../features/idea/components/IdeaCard";
import { PinIdeaButton } from "../features/idea/components/PinIdeaButton";
import Heading from "../shared/ui/Heading";
import Text from "../shared/ui/Text";
import Chip from "../shared/ui/Chip";
import Icon from "../shared/ui/Icon";

//A SUPPRIMER, mettre useStep dans la foncton princiale et dans le .map
const mockSteps = [
  { id: 1, name: "Montreux" },
  { id: 2, name: "Interlaken" },
  { id: 3, name: "Zermatt" },
];

/*----------------------------------------------------------------------------------*/

// Fonction pour filtrer les type d'idées et les étapes
type IdeaFilter = "all" | IdeaType;
type StepFilter = "all" | "none" | number;

function filterIdeas(
  ideas: Idea[],
  typeActiveFilter: IdeaFilter,
  stepActiveFilter: StepFilter,
) {
  let filteredIdeas = ideas;

  if (typeActiveFilter !== "all") {
    filteredIdeas = filteredIdeas.filter(
      (idea) => idea.type === typeActiveFilter,
    );
  }

  if (stepActiveFilter === "none") {
    filteredIdeas = filteredIdeas.filter((idea) => idea.step_id === null);
  } else if (stepActiveFilter !== "all") {
    filteredIdeas = filteredIdeas.filter(
      (idea) => idea.step_id === stepActiveFilter,
    );
  }

  return filteredIdeas;
}

/*----------------------------------------------------------------------------------*/

// Fonction principale pour la page idée
export function IdeasPage() {
  const ideas = useIdeas();

  const [typeActiveFilter, setTypeActiveFilter] = useState<IdeaFilter>("all");
  const [stepActiveFilter, setStepActiveFilter] = useState<StepFilter>("all");

  const filteredIdeas = filterIdeas(ideas, typeActiveFilter, stepActiveFilter);

  return (
    <div className="px-8 pt-8">
      <div className="mb-6 flex items-center justify-between">
        <Heading level={1} size="lg">
          Idées
        </Heading>
        <PinIdeaButton />
      </div>

      <div>
        <Text tone="muted" className="mb-1">
          Type
        </Text>
        <div className="mb-8 flex flex-wrap gap-2">
          <Chip
            active={typeActiveFilter === "all"}
            onClick={() => setTypeActiveFilter("all")}
          >
            Tous
          </Chip>

          <Chip
            active={typeActiveFilter === "restaurant"}
            onClick={() => setTypeActiveFilter("restaurant")}
          >
            <Icon name="fork" size={18} />
            Restaurant
          </Chip>

          <Chip
            active={typeActiveFilter === "accommodation"}
            onClick={() => setTypeActiveFilter("accommodation")}
          >
            <Icon name="bed" size={18} />
            Hébérgement
          </Chip>

          <Chip
            active={typeActiveFilter === "activity"}
            onClick={() => setTypeActiveFilter("activity")}
          >
            <Icon name="mtn" size={18} />
            Activité
          </Chip>

          <Chip
            active={typeActiveFilter === "sightseeing"}
            onClick={() => setTypeActiveFilter("sightseeing")}
          >
            <Icon name="pin" size={18} />A voir
          </Chip>
        </div>
      </div>

      <div>
        <Text tone="muted" className="mb-1">
          Etape
        </Text>
        <div className="mb-8 flex flex-wrap gap-2">
          <Chip
            active={stepActiveFilter === "all"}
            onClick={() => setStepActiveFilter("all")}
          >
            Toutes
          </Chip>

          {mockSteps.map((step) => (
            <Chip
              key={step.id}
              active={stepActiveFilter === step.id}
              onClick={() => setStepActiveFilter(step.id)}
            >
              {step.name}
            </Chip>
          ))}

          <Chip
            active={stepActiveFilter === "none"}
            onClick={() => setStepActiveFilter("none")}
          >
            Sans étape
          </Chip>
        </div>
      </div>

      {filteredIdeas.map((idea) => (
        <IdeaCard
          key={idea.id}
          idea={idea}
          proposerName="David"
          proposerInitials="DL"
          voteCount={0}
          voted={false}
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



const numbers = [1, 2, 3, 4, 5];
ideas.filter((idea) => idea.type === "restaurant");
*/
