import { useState } from "react";
import { useIdeas } from "../features/idea/hooks/useIdeas";
import { IdeaCard } from "../features/idea/components/IdeaCard";
import { PinIdeaButton } from "../features/idea/components/PinIdeaButton";
import { CreateIdeaModal } from "../features/idea/components/CreateIdeaModal";
import { filterIdeas, type IdeaFilter, type StepFilter } from "../features/idea/utils/filterIdeas";
import Heading from "../shared/ui/Heading";
import Text from "../shared/ui/Text";
import Chip from "../shared/ui/Chip";
import Icon from "../shared/ui/Icon";

//A SUPPRIMER, mettre useStep dans la foncton princiale et dans le .map
const mockSteps = [
  { id: 1, name: "Interlaken" },
  { id: 2, name: "Zermatt" },
];

/*----------------------------------------------------------------------------------*/

// Fonction principale pour la page idée
export function IdeasPage() {
  const ideas = useIdeas();

  const [typeActiveFilter, setTypeActiveFilter] = useState<IdeaFilter>("all");
  const [stepActiveFilter, setStepActiveFilter] = useState<StepFilter>("all");

  const [createIdeaModalOpen, setCreateIdeaModalOpen] = useState(false);

  const filteredIdeas = filterIdeas(ideas, typeActiveFilter, stepActiveFilter);

  return (
    <div className="px-8 pt-8">
      <div className="mb-6 flex items-center justify-between">
        <Heading level={1} size="lg">
          Idées
        </Heading>
        <PinIdeaButton onClick={() => setCreateIdeaModalOpen(true)} />
      </div>

      <div>
        <Text tone="primary" className="mb-1">
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
        <Text tone="primary" className="mb-1">
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

      {filteredIdeas.map((idea) => {
        const step = mockSteps.find((step) => step.id === idea.stepId);

        return (
          <IdeaCard
            key={idea.id}
            idea={idea}
            proposerName="David"
            proposerInitials="DL"
            voteCount={0}
            voted={false}
            stepName={step?.name}
          />
        );
      })}

      {createIdeaModalOpen && (
        <CreateIdeaModal steps={mockSteps} onClose={() => setCreateIdeaModalOpen(false)} />
      )}
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

//<Text tone="accent" size="sm">

//crée un composant React nommé IdeaCard, reçoit des propriétés correspondant à IdeaCardProps récupère directement idea.
// <p> pour une balise, <h> pour un titre
// le ?? signgfie que si c est null, affiche un message
// justify-between = premiere element le plus a gauchee possible et l autre le plus a droite possible
// flex items-start gap-3" = aligne les blocs par le haut
// flex items-center gap-3" = centre verticalement les blocs
// flex flex-col aligne verticalement les elements

/*
flex             = horizontal
flex-col         = vertical

justify-between  = écarte gauche / droite
justify-center   = centre sur l'axe principal

items-start      = aligne en haut
items-center     = aligne au centre
items-end        = aligne à la fin

gap-*            = espace entre les éléments

flex-col       = vertical
flex-row       = horizontal
flex-wrap  tenir sur une seule ligne ou s'ils peuvent passer automatiquement à la ligne suivante lorsque l'espace manque

items-start    = aligner en haut
items-center   = centrer

justify-between = séparer gauche/droite
justify-center  = centrer

gap-3          = espace entre éléments

shrink-0       = ne pas rétrécir
min-w-0        = autoriser à rétrécir

className="px-8 pt-8" espace en haut
px-8 pb-8


pr-8  → padding-right
pl-8  → padding-left
px-8  → padding gauche + droite

mr-8  → margin-right
ml-8  → margin-left
mx-8  → margin gauche + droite
mb-8  en dessous



const numbers = [1, 2, 3, 4, 5];
ideas.filter((idea) => idea.type === "restaurant");




flex-col → éléments verticalement sur mobile.
sm:flex-row → repasse horizontalement sur écran plus large.
flex-wrap → autorise les éléments à passer à la ligne s’il manque de place.
w-full → prend toute la largeur disponible sur mobile.
sm:w-auto → reprend sa largeur naturelle sur écran plus grand.
items-start → aligne les éléments par le haut.
items-center → centre verticalement.
items-end → aligne vers la droite dans certains flex-col.
justify-between → un groupe à gauche, un autre à droite.
self-end → pousse un élément seul vers la droite.
gap-1, gap-2, gap-3 → espace entre les éléments.
min-w-0 → autorise le texte à rétrécir dans un flex.
shrink-0 → empêche l’icône ou un bouton de s’écraser.
whitespace-nowrap → empêche un petit bouton comme Voir l'étape de couper son texte sur deux lignes.
break-words → autorise un titre long à revenir proprement à la ligne.

px → largeur intérieure du bouton
py → hauteur intérieure du bouton
text → taille du chiffre

  className="!px-2 !py-1 !text-xs sm:!px-5 sm:!py-3 sm:!text-sm" / text-base

*/
