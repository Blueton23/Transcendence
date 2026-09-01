import { useState } from "react";
import type { ReactNode } from "react";
import Button from "../shared/ui/Button";
import Badge from "../shared/ui/Badge";
import Avatar from "../shared/ui/Avatar";
import Card from "../shared/ui/Card";
import Heading from "../shared/ui/Heading";
import Text from "../shared/ui/Text";
import Chip from "../shared/ui/Chip";
import IconButton from "../shared/ui/IconButton";
import Divider from "../shared/ui/Divider";
import Input from "../shared/ui/Input";
import Tag from "../shared/ui/Tag";
import Icon, { iconNames } from "../shared/ui/Icon";
import { DatePicker } from "../shared/ui/DatePicker";
import type { DateRange } from "@daypicker/react";

/* page de Design System */

/* Helper pour la page design system */

interface SectionProps {
  name: string;
  role: string;
  children: ReactNode;
}

function Section({ name, role, children }: SectionProps) {
  return (
    <section className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-6 shadow-sm">
      <div className="flex flex-col gap-1">
        <h2 className="font-mono text-md font-bold text-text">{`<${name} />`}</h2>
        <p className="max-w-prose text-md text-text-secondary">{role}</p>
      </div>
      <Divider />
      <div className="flex flex-col gap-5">{children}</div>
    </section>
  );
}

interface SpecimenProps {
  label: string;
  children: ReactNode;
}

function Specimen({ label, children }: SpecimenProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="font-mono text-xs text-muted">{label}</span>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

function DesignSystem() {
  const [cat, setCat] = useState("resto");
  const [selected, setSelected] = useState<DateRange>();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-8">
      <header className="flex flex-col gap-2">
        <Heading level={1} size="lg">
          Design system
        </Heading>
        <Text tone="secondary">
          Catalogue de shared/ui, avec les variantes réelles telles qu'elles
          apparaissent dans la maquette.
        </Text>
      </header>

      <Section
        name="Button"
        role="L'action principale d'un écran : épingler une idée, ajouter une étape."
      >
        <Specimen label='variant="primary"'>
          <Button variant="primary">Enregister les modifications</Button>
        </Specimen>
        <Specimen label='variant="dark"'>
          <Button variant="dark">Ajouter une étape</Button>
        </Specimen>
        <Specimen label='variant="outline"'>
          <Button variant="outline">Ajouter une dépense</Button>
        </Specimen>
        <Specimen label='variant="danger"'>
          <Button variant="danger">Confirmer</Button>
        </Specimen>
        <Specimen label="icon">
          <Button variant="primary" icon={<Icon name="pinplus" size={16} />}>
            Epingler une idee
          </Button>
        </Specimen>
      </Section>

      <Section
        name="IconButton"
        role="Comme Button mais sans texte, juste une icône dans un rond. Pour les actions évidentes : fermer, ajouter, options. label reste obligatoire pour savoir ce que c'est"
      >
        <Specimen label='variant="outline" (défaut) · size="sm" — 34px'>
          <IconButton
            icon={<Icon name="back" size={16} />}
            label="Ajouter"
            variant="outline"
            size="sm"
          />
        </Specimen>
        <Specimen label='variant="flat" · size="sm"'>
          <IconButton
            icon={<Icon name="x" size={16} />}
            label="Fermer"
            variant="flat"
            size="sm"
          />
        </Specimen>
        <Specimen label='variant="primary" · size="md" — 44px'>
          <IconButton
            icon={<Icon name="pinplus" size={20} />}
            label="Epingler une idee"
            variant="primary"
            size="md"
          />
        </Specimen>
        <Specimen label='variant="ghost" · size="sm" — 44px'>
          <IconButton
            icon={<Icon name="dots" size={16} />}
            label="Voir les options"
            variant="ghost"
            size="sm"
          />
        </Specimen>
      </Section>

      <Section
        name="Icon"
        role="Pointe vers le sprite SVG extrait de la maquette (un seul defs, inséré une fois dans index.html). name = l'id du symbol sans le préfixe i-. La couleur suit le texte parent, donc on la change avec une classe text-*."
      >
        <Specimen label="size={20} (défaut) · la couleur suit le texte parent">
          <Icon name="pin" />
          <Icon name="heart" className="text-brand-primary" />
          <Icon name="check" className="text-success" />
          <Icon name="moon" className="text-muted" />
        </Specimen>
        <Specimen label="size — en pixels, largeur et hauteur à la fois">
          <Icon name="mtn" size={14} />
          <Icon name="mtn" size={20} />
          <Icon name="mtn" size={28} />
        </Specimen>
        <Specimen label={`name — les ${iconNames.length} icônes du sprite`}>
          <div className="grid w-full grid-cols-[repeat(auto-fill,minmax(84px,1fr))] gap-3">
            {iconNames.map((n) => (
              <div
                key={n}
                className="flex flex-col items-center gap-1.5 rounded-sm border border-border bg-surface-container p-2"
              >
                <Icon name={n} />
                <span className="font-mono text-2xs text-muted">{n}</span>
              </div>
            ))}
          </div>
        </Specimen>
      </Section>

      <Section
        name="Chip"
        role="Filtre sélectionnable. Se clique, et surtout : il a un état. Sert à choisir une catégorie parmi plusieurs."
      >
        <Specimen label="active={true} / active={false} — cliquez pour changer la sélection">
          <Chip
            active={cat === "resto"}
            onClick={() => setCat("resto")}
            icon={<Icon name="fork" size={16} />}
          >
            Resto
          </Chip>
          <Chip
            active={cat === "hebergement"}
            onClick={() => setCat("hebergement")}
            icon={<Icon name="bed" size={16} />}
          >
            Hébergement
          </Chip>
          <Chip active={cat === "activite"} onClick={() => setCat("activite")}>
            Tous
          </Chip>
          <Chip active={cat === "avoir"} onClick={() => setCat("avoir")}>
            Sans etapes
          </Chip>
        </Specimen>
      </Section>

      <Section name="Badge" role="Étiquette de statut. Ne se clique pas.">
        <Specimen label='variant="success" — validé, réservé, accepte'>
          <Badge variant="success">Réservé</Badge>
          <Badge icon={<Icon name="check" size={16} />} variant="success">
            Accepte
          </Badge>
        </Specimen>
        <Specimen label='variant="warning" — en attente, info neutre, en tete'>
          <Badge variant="warning" icon={<Icon name="clock" size={16} />}>
            En attente
          </Badge>
          <Badge variant="warning">Séjour · 2 nuits</Badge>
          <Badge variant="warning">EN TETE</Badge>
        </Specimen>
        <Specimen label='variant="error" — action requise'>
          <Badge variant="error">A choisir</Badge>
        </Specimen>
      </Section>

      <Section
        name="Tag"
        role="repère factuel en mono (jour, date, autre). Simple texte, jamais cliquable. Avec un chevron pour faire un composant pliable, mais ce n'est pas Tag qui s'en charge."
      >
        <Specimen label='tone="default" (défaut) — bordé, texte secondaire'>
          <Icon name="chev-down" size={15} className="text-muted" />
          <Tag>JOUR 1 · dim 12</Tag>
          <Icon name="chev-down" size={15} className="text-muted" />
          <Tag>JOUR 2 · lun 13</Tag>
        </Specimen>

        <Specimen label='tone="muted" — sans bordure, info neutre de rattachement'>
          <Tag tone="muted">Pool general</Tag>
          <Tag tone="muted">→ Zermatt</Tag>
        </Specimen>

        <Specimen label='tone="inverse"  — sur fond sombre (bandeau voyage)'>
          <div className="flex gap-3 rounded-md bg-brand-dark p-3">
            <Tag tone="inverse">12 - 16 juil.</Tag>
            <Tag tone="inverse">219 km</Tag>
          </div>
        </Specimen>
      </Section>

      <Section name="Avatar" role="Identité d’un participant, initiales.">
        <Specimen label='size="xs" | "sm" | "md" (défaut) | "lg"'>
          <Avatar size="xs">DL</Avatar>
          <Avatar size="sm">SD</Avatar>
          <Avatar size="md">SC</Avatar>
          <Avatar size="lg">CP</Avatar>
        </Specimen>
        <Specimen label='color="1" (défaut) | "2" | "3" | "4"'>
          <Avatar color="1">SD</Avatar>
          <Avatar color="2">DL</Avatar>
          <Avatar color="3">SC</Avatar>
          <Avatar color="4">CP</Avatar>
        </Specimen>
      </Section>

      <Section name="Card" role="Conteneur d’un bloc de contenu.">
        <Specimen label='variant="default" (défaut)'>
          <Card variant="default">Carte normale</Card>
        </Specimen>
        <Specimen label='variant="default avec hover" (défaut + hover)'>
          <Card variant="default" interactive={true}>
            Carte normale avec hover (pour les etapes)
          </Card>
        </Specimen>
        <Specimen label='variant="accent" — proposition en attente de décision'>
          <Card variant="accent">Carte à choisir</Card>
        </Specimen>
        <Specimen label='variant="success" — confirmé'>
          <Card variant="success">Hébergement réservé</Card>
        </Specimen>
        <Specimen label='variant="alert" — problème à traiter'>
          <Card variant="alert">2 nuits sans hébergement</Card>
        </Specimen>
        <Specimen label='variant="dashed" — zone à remplir'>
          <Card variant="dashed">Idées à placer</Card>
        </Specimen>
        <Specimen label='variant="dashed-accent" — zone à remplir, urgente'>
          <Card variant="dashed-accent">Nuit à choisir</Card>
        </Specimen>
      </Section>

      <Section name="Input" role="Champ de saisie sur une ligne.">
        <Specimen label='variant="default" (défaut) — texte courant'>
          <Input className="max-w-xs" placeholder="Nom du lieu" />
        </Specimen>
        <Specimen label='variant="mono" — dates, montants'>
          <Input className="max-w-xs" variant="mono" placeholder="12.08.2026" />
        </Specimen>
      </Section>

      <Section name="Divider" role="Trait de séparation entre deux blocs.">
        <Specimen label='orientation="horizontal" (défaut)'>
          <div className="w-full">
            <Divider />
          </div>
        </Specimen>
        <Specimen label='orientation="vertical"'>
          <Text tone="muted">Jour 1</Text>
          <Divider orientation="vertical" />
          <Text tone="muted">Montreux</Text>
        </Specimen>
      </Section>

      <Section
        name="Heading"
        role="level choisit la balise HTML (h1/h2/h3), size choisit la taille visuelle. Les deux sont indépendantes — un h1 peut rester petit."
      >
        <Specimen label='level={1} size="lg" — titre de page'>
          <Heading level={1} size="lg">
            Mes voyages
          </Heading>
        </Specimen>
        <Specimen label='level={2} size="md" (défaut) — titre de carte'>
          <Heading level={2} size="md">
            Montreux
          </Heading>
        </Specimen>
        <Specimen label='level={3} size="sm" — sous-titre'>
          <Heading level={3} size="sm">
            Hébergement
          </Heading>
        </Specimen>
      </Section>

      <Section
        name="Text"
        role="Corps de texte. tone règle l'importance, du contenu principal au détail en retrait."
      >
        <Specimen label='tone="primary" (défaut) — contenu principal'>
          <Text tone="primary">Charlotte a voté pour Chalet à Grindelwald</Text>
        </Specimen>
        <Specimen label='tone="secondary" — phrase courante'>
          <Text tone="secondary">a voté pour Chalet à Grindelwald</Text>
        </Specimen>
        <Specimen label='tone="muted" — timestamp, hint'>
          <Text tone="muted">à l'instant</Text>
        </Specimen>
        <Specimen label='tone="success" — valide, reserve'>
          <Text tone="success">Chalet à Grindelwald · réservé</Text>
        </Specimen>
        <Specimen label='tone="accent" — action requise'>
          <Text tone="accent">À choisir · 2 propositions </Text>
        </Specimen>
        <Specimen label='size="md" (défaut, 14px) vs size="sm" (12px, densité compacte)'>
          <Text size="md">Pas de nuit · 2 idées épinglées</Text>
          <Text size="sm" tone="muted">
            Pas de nuit · 2 idées épinglées
          </Text>
        </Specimen>
        <Specimen label='font="sans" (défaut) vs font="mono" — pour une valeur quon scanne, pas une phrase quon lit'>
          <Text font="mono" tone="muted">
            95 CHF{" "}
          </Text>
          <Text font="sans">· réservé · PDF joint</Text>
        </Specimen>
        <Specimen label="composition — deux fragments, chacun sa police, pas un seul Text qui devine">
          <span className="inline-flex items-center gap-1">
            <Text font="mono" tone="muted">
              48 CHF
            </Text>
            <Text tone="muted">· par Damien</Text>
          </span>
        </Specimen>
      </Section>

      <Section name="Calendrier" role="choix de dates">
        <Specimen label="2 mois range">
          <Card className="flex justify-center p-4">
            <DatePicker selected={selected} onSelect={setSelected} />
          </Card>
        </Specimen>
      </Section>
    </div>
  );
}

export default DesignSystem;
