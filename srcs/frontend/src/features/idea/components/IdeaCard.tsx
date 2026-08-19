import type { Idea } from "../types";
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
    pricePerNight?: number;
}

//defini le type d icone qui sera afficher
const ideaIcons = {
    restaurant: "fork",
    accommodation: "bed",
    activity: "mtn",
    sightseeing: "pin",
} as const;


export function IdeaCard({ idea, proposerName, proposerInitials, voteCount, stepName, pricePerNight }: IdeaCardProps) {

  let stepButton;

  if (idea.step_id === null) {
      stepButton = (
        <Button variant="outline">
          <Text tone="accent" size="sm">
            <div className="flex flex-row items-end gap-1">
              À placer
                {<Icon name="arrow" size={14} />}
            </div>
          </Text>
        </Button>
    );
  } else {
      stepButton = (
        <Button variant="outline">
          Voir l'étape
        </Button>
    );
  }

  let stepLabel;

  if (idea.step_id === null) {
    stepLabel = (
        <Tag tone="muted">
          Pool Générale
        </Tag>
    );
  } else {
    stepLabel = (
        <Tag tone="muted">
          {`→ ${stepName}`}
        </Tag>
    );
  }

  let priceAccommodation

  if (idea.type === "accommodation" && pricePerNight != null) {
    priceAccommodation = (
        <Text tone="muted" size="sm">
          {idea.price_per_night} CHF . {proposerName}
        </Text>
    );
  }








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
            {priceAccommodation}

            <div className="flex items-center gap-3">
              <Avatar size="xs" color="2">
                {proposerInitials}
              </Avatar>
              <Text tone="muted" size="sm">
                proposée par {proposerName}
              </Text>
                {stepLabel}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button variant="primary"> {<Icon name="heart-f" size={16} />}
            {voteCount}
          </Button>
          {stepButton}
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
*/