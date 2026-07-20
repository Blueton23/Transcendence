import { useState } from 'react';
import type { ReactNode } from 'react';
import Button from '../shared/ui/Button';
import Badge from '../shared/ui/Badge';
import Avatar from '../shared/ui/Avatar';
import Card from '../shared/ui/Card';
import Heading from '../shared/ui/Heading';
import Text from '../shared/ui/Text';
import Chip from '../shared/ui/Chip';
import IconButton from '../shared/ui/IconButton';
import Divider from '../shared/ui/Divider';
import Input from '../shared/ui/Input';
import Tag from '../shared/ui/Tag';
import Icon, { iconNames } from '../shared/ui/Icon';

/* page de démo */

/* Helper pour la page demo */

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

function Demo() {
  const [cat, setCat] = useState('resto');

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-8">
      <header className="flex flex-col gap-2">
        <Heading level={1} size="lg">Design system</Heading>
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
          <Button variant="primary">Epingler une idée</Button>
        </Specimen>
        <Specimen label='variant="dark"'>
          <Button variant="dark">Ajouter une étape</Button>
        </Specimen>
        <Specimen label='variant="outline"'>
          <Button variant="outline">Ajouter une dépense</Button>
        </Specimen>
        <Specimen label="icon">
          <Button variant="primary" icon={<Icon name="plus" size={16} />}>Avec icône</Button>
        </Specimen>
      </Section>

      <Section
        name="IconButton"
        role="Comme Button mais sans texte, juste une icône dans un rond. Pour les actions évidentes : fermer, ajouter, options. label reste obligatoire pour savoir ce que c'est"
      >
        <Specimen label='variant="outline" (défaut) · size="sm" — 34px'>
          <IconButton icon={<Icon name="plus" size={16} />} label="Ajouter" variant="outline" size="sm" />
        </Specimen>
        <Specimen label='variant="dark" · size="sm"'>
          <IconButton icon={<Icon name="plus" size={16} />} label="Ajouter" variant="dark" size="sm" />
        </Specimen>
        <Specimen label='variant="primary" · size="md" — 44px, action flottante'>
          <IconButton icon={<Icon name="plus" size={16} />} label="Ajouter" variant="primary" size="md" />
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
              <div key={n} className="flex flex-col items-center gap-1.5 rounded-sm border border-border bg-surface-container p-2">
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
          <Chip active={cat === 'resto'} onClick={() => setCat('resto')}>Resto</Chip>
          <Chip active={cat === 'hebergement'} onClick={() => setCat('hebergement')}>Hébergement</Chip>
          <Chip active={cat === 'activite'} onClick={() => setCat('activite')}>Activité</Chip>
          <Chip active={cat === 'avoir'} onClick={() => setCat('avoir')}>À voir</Chip>
        </Specimen>
      </Section>

      <Section
        name="Badge"
        role="Étiquette de statut. Ne se clique pas."
      >
        <Specimen label='variant="success" — validé, réservé'>
          <Badge variant="success">Réservé</Badge>
        </Specimen>
        <Specimen label='variant="warning" — à surveiller'>
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
        <Specimen label="children — texte libre ; le chevron est un voisin, pas un enfant">
          <Icon name="chev-down" size={15} className="text-muted" />
          <Tag>JOUR 1 · dim 12</Tag>
          <Icon name="chev-down" size={15} className="text-muted" />
          <Tag>JOUR 2 · lun 13</Tag>
        </Specimen>
      </Section>

      <Section
        name="Avatar"
        role="Identité d’un participant, initiales."
      >
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

      <Section
        name="Card"
        role="Conteneur d’un bloc de contenu."
      >
        <Specimen label='variant="default" (défaut)'>
          <Card variant="default">Carte normale</Card>
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

      <Section
        name="Input"
        role="Champ de saisie sur une ligne."
      >
        <Specimen label='variant="default" (défaut) — texte courant'>
          <Input className="max-w-xs" placeholder="Nom du lieu" />
        </Specimen>
        <Specimen label='variant="mono" — dates, montants'>
          <Input className="max-w-xs" variant="mono" placeholder="12.08.2026" />
        </Specimen>
      </Section>

      <Section
        name="Divider"
        role="Trait de séparation entre deux blocs."
      >
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
          <Heading level={1} size="lg">Mes voyages</Heading>
        </Specimen>
        <Specimen label='level={2} size="md" (défaut) — titre de carte'>
          <Heading level={2} size="md">Montreux</Heading>
        </Specimen>
        <Specimen label='level={3} size="sm" — sous-titre'>
          <Heading level={3} size="sm">Hébergement</Heading>
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
      </Section>
    </div>
  );
}

export default Demo;
