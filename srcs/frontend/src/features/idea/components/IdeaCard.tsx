import type { Idea, IdeaType } from "../types";
import Card from "../../../shared/ui/Card";
import Icon from "../../../shared/ui/Icon";
import Heading from "../../../shared/ui/Heading";
import Button from "../../../shared/ui/Button";
import Text from "../../../shared/ui/Text";
import Avatar from "../../../shared/ui/Avatar";
import Tag from "../../../shared/ui/Tag";

//définis ce que mon composant accepte en entrée
export interface IdeaCardProps {
    idea: Idea;
    proposerName: string;
    proposerInitials: string;
    voteCount: number;
    stepName?: string;
}

//defini le type d icone qui sera afficher
const ideaIcons = {
    restaurant: "fork",
    accommodation: "bed",
    activity: "mtn",
    sightseeing: "pin",
} as const;

// bouton de droite, a placer ou voir l etape
function stepButton(stepId: number | null) {
  if (stepId === null) {
    return (
      <Button>
        <Text tone="accent" size="sm">
          À placer
            {<Icon name="arrow" size={14} />}
        </Text>
      </Button>
    );
  }

    return (
      <Button variant="outline">
        Voir l'étape
      </Button>
    );
}

// a gauche, defini si pool generale ou si une etape et afficher
function stepLabel(stepId: number | null, stepName: string) {
  if (stepId === null) {
    return (
      <Tag tone="muted">
        Pool Général
      </Tag>
    );
  }

    return (
      <Tag tone="muted">
          {`→ ${stepName}`}
      </Tag>
    );
}

// a gauche, si c est un herbegement ecrit le prix et proposer par
function secondaryInfo(ideaType: IdeaType, pricePerNight: number | null, proposerName: string, proposerInitials: string) {
  if (ideaType === "accommodation" && pricePerNight != null) {
    return (
      <div className="flex items-center gap-3">
        <Avatar size="xs" color="2">
          {proposerInitials}
        </Avatar>

        <Text tone="muted" size="sm">
          {pricePerNight} CHF . {proposerName}
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

export function IdeaCard({ idea, proposerName, proposerInitials, voteCount, stepName }: IdeaCardProps) {

  return (
    <Card>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-error-bg">
            <Icon name={ideaIcons[idea.type]}/>
          </div>

          <div className="flex min-w-0 flex-col">
            <Heading level={3} size="sm">
              {idea.title}
            </Heading>

            <div className="flex items-center gap-3">
                {secondaryInfo(idea.type, idea.price_per_night, proposerName, proposerInitials)}
                {stepLabel(idea.step_id, stepName)}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button variant="primary"> {<Icon name="heart-f" size={16} />}
            {voteCount}
          </Button>
          {stepButton(idea.step_id)}
        </div>
      </div>
    </Card>
  );
}




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
*/
