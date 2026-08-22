import type { Idea, IdeaType } from "../types";
import Card from "../../../shared/ui/Card";
import Icon from "../../../shared/ui/Icon";
import Heading from "../../../shared/ui/Heading";
import Button from "../../../shared/ui/Button";
import Text from "../../../shared/ui/Text";
import Avatar from "../../../shared/ui/Avatar";
import Tag from "../../../shared/ui/Tag";

// Défini les composant d'entrée
export interface IdeaCardProps {
  idea: Idea;
  proposerName: string;
  proposerInitials: string;
  voteCount: number;
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

// Fonction pour le bouton de droite, le coeur de vote
function voteButton(voteCount: number, onVote?: () => void) {
  return (
    <Button variant="outline" onClick={onVote} className="!px-3 !py-2 !text-xs sm:!px-5 sm:!py-3 sm:!text-sm" >
      {<Icon name="heart-f" size={16} />}
      {voteCount}
    </Button>
  );
}

// Fonction pour le bouton de droite "A placer" / "Voir l'étape"
function stepButton(stepId: number | null, onPlace?: () => void, onView?: () => void) {
  if (stepId === null) {
    return (
      <Button variant="outline" onClick={onPlace} className="!px-3 !py-2 !text-xs sm:!px-5 sm:!py-3 sm:!text-sm">
        <span className="text-xs text-error" >
          Placer
        </span>
        <Icon name="arrow" size={14} className="text-error" />
      </Button>
    );
  }

  return <Button variant="outline" onClick={onView} className="!px-3 !py-2 !text-xs sm:!px-5 sm:!py-3 sm:!text-sm" >Voir l'étape</Button>;
}

/*----------------------------------------------------------------------------------*/

// Fonction pour la partie gauche, défini si pool générale ou une étape a afficher
function stepLabel(stepId: number | null, stepName: string) {
  if (stepId === null) {
    return <Tag tone="muted">Pool Général</Tag>;
  }

  return <Tag tone="muted">{`→ ${stepName}`}</Tag>;
}

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
      <div className="flex items-center gap-3">
        <Avatar size="xs" color="2">
          {proposerInitials}
        </Avatar>

        <Text tone="muted" size="sm">
          {pricePerNight} CHF . par {proposerName}
        </Text>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Avatar size="xs" color="2">
        {proposerInitials}
      </Avatar>

      <Text tone="muted" size="sm">
        proposée par {proposerName}
      </Text>
    </div>
  );
}

/*----------------------------------------------------------------------------------*/

// Fonction principale pour une seule carte d'idée
export function IdeaCard({
  idea,
  proposerName,
  proposerInitials,
  voteCount,
  stepName,
  onPlace,
  onView,
  onVote,
}: IdeaCardProps) {
  return (
    <Card>
      <div className="flex flex-row sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-1 items-start gap-2 sm:gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-error-bg sm:h-10 sm:w-10">
            <Icon name={ideaIcons[idea.type]} />
          </div>

          <div className="flex min-w-0 flex-1 flex-col whitespace-nowrap">
            <Heading level={3} size="sm" className="whitespace-nowrap">
              {idea.title}
            </Heading>

            <div className="flex items-center gap-3">
              {secondaryInfo(
                idea.type,
                idea.price_per_night,
                proposerName,
                proposerInitials,
              )}
              {stepLabel(idea.step_id, stepName)}
            </div>
          </div>
        </div>

        <div className="flex flex-col shrink-0 items-end justify-end whitespace-nowrap gap-2 sm:flex-row sm:gap-3">
          {voteButton(voteCount, onVote)}
          {stepButton(idea.step_id, onPlace, onView)}
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
