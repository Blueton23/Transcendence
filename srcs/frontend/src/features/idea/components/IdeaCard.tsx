import type { Idea, IdeaType } from "../types";
import { VoteButton } from "./VoteButton";
import { StepButton } from "./StepButton";
import Card from "../../../shared/ui/Card";
import Icon from "../../../shared/ui/Icon";
import Heading from "../../../shared/ui/Heading";
import Text from "../../../shared/ui/Text";
import Avatar from "../../../shared/ui/Avatar";
import Tag from "../../../shared/ui/Tag";

// Défini les composant d'entrée
export interface IdeaCardProps {
  idea: Idea;
  proposerName: string;
  proposerInitials: string;
  voteCount: number;
  voted: boolean;
  stepName: string;
  onPlace?: () => void;
  onView?: () => void;
  onVote?: () => void;
}

/*----------------------------------------------------------------------------------*/

// Défini le type d'icone a afficher
const ideaIcons = {
  restaurant: "fork",
  accommodation: "bed",
  activity: "mtn",
  sightseeing: "pin",
} as const;

/*----------------------------------------------------------------------------------*/

// Fonction pour la partie gauche, si c'est un hébérgement , écrit "le prix" / "proposé par"
// Si c'est un autre type, met le logo "initiale" / "proposé par"
function secondaryInfo(
  ideaType: IdeaType,
  pricePerNight: number | null,
  proposerName: string,
  proposerInitials: string,
) {
  if (ideaType === "accommodation" && pricePerNight !== null) {
    return (
      <div className="flex items-center gap-2 sm:gap-2">
        <Avatar size="xs" color="2">
          {proposerInitials}
        </Avatar>

        <Text tone="muted" size="sm" className="text-xs sm:text-sm">
          {pricePerNight} CHF/nuit par {proposerName}
        </Text>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 sm:gap-2">
      <Avatar size="xs" color="2">
        {proposerInitials}
      </Avatar>

      <Text tone="muted" size="sm" className="text-xs sm:text-sm">
        proposée par {proposerName}
      </Text>
    </div>
  );
}

// Fonction pour la partie gauche, défini si pool générale ou une étape a afficher
function stepLabel(stepId: number | null, stepName: string) {
  if (stepId === null) {
    return (
      <Tag tone="muted" className="text-xs">
        Pool Général
      </Tag>
    );
  }

  return <Tag tone="muted" className="text-xs">
            {`→ ${stepName}`}
          </Tag>;
}

/*----------------------------------------------------------------------------------*/

// Fonction principale pour une seule carte d'idée
export function IdeaCard({
  idea,
  proposerName,
  proposerInitials,
  voteCount,
  voted,
  stepName,
  onPlace,
  onView,
  onVote,
}: IdeaCardProps) {
  return (
    <Card>
      <div className="flex flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-1 items-start gap-2 sm:items-center sm:gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-error-bg sm:size-10">
            <Icon name={ideaIcons[idea.type]} />
          </div>

          <div className="flex min-w-0 flex-1 flex-col">
            <Heading
              level={3}
              size="sm"
              className="truncate !text-xs whitespace-nowrap sm:!text-sm"
            >
              {idea.title}
            </Heading>

            <div className="flex min-w-0 flex-col items-start gap-1 sm:flex-row sm:items-center sm:gap-1.5">
              {secondaryInfo(
                idea.type,
                idea.pricePerNight,
                proposerName,
                proposerInitials,
              )}
              {stepLabel(idea.stepId, stepName)}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end justify-end gap-2 whitespace-nowrap sm:flex-row sm:gap-3">
          <VoteButton voteCount={voteCount} voted={voted} onVote={onVote} />
          <StepButton stepId={idea.stepId} onPlace={onPlace} onView={onView} />
        </div>
      </div>
    </Card>
  );
}

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
