import { useState } from "react";
import type { ReactNode } from "react";
import type { DateRange } from "@daypicker/react";
import { useTranslation } from "react-i18next";

import { ideaTypes, type IdeaFilter } from "@/features/idea/types";
import { ideaTypeLabels } from "@/features/idea/utils/ideaTypeLabels";
import { ideaIcons } from "@/features/idea/utils/ideaIcons";
import { categories } from "@/features/spending/types";
import { spendingCategoryBands } from "@/features/spending/utils/spendingCategoryBands";
import { spendingCategoryLabels } from "@/features/spending/utils/spendingCategoryLabels";
import Avatar, { type AvatarColor } from "@/shared/ui/Avatar";
import Banner from "@/shared/ui/Banner";
import Button from "@/shared/ui/Button";
import Card from "@/shared/ui/Card";
import Chip from "@/shared/ui/Chip";
import { DatePicker } from "@/shared/ui/DatePicker";
import Divider from "@/shared/ui/Divider";
import Dot from "@/shared/ui/Dot";
import Heading from "@/shared/ui/Heading";
import Icon, { iconNames } from "@/shared/ui/Icon";
import IconButton from "@/shared/ui/IconButton";
import Input from "@/shared/ui/Input";
import OnlineDot from "@/shared/ui/OnlineDot";
import OnlineStatus from "@/shared/ui/OnlineStatus";
import { OptionsMenu } from "@/shared/ui/OptionsMenu";
import Tag from "@/shared/ui/Tag";
import Text from "@/shared/ui/Text";
import { dotColors } from "@/shared/utils/dotColors";
import { DropdownDemo } from "./DropdownDemo";

/* Design system page: every shared/ui component and token, with the
   variants actually used in the app. Dev page, not translated. */

/* ---------------------------------------------------------------- data */

const nav = [
  {
    group: "Fondations",
    items: [
      { id: "couleurs", label: "Couleurs" },
      { id: "typographie", label: "Typographie" },
      { id: "formes", label: "Formes et ombres" },
      { id: "icones", label: "Icônes" },
    ],
  },
  {
    group: "Composants",
    items: [
      { id: "button", label: "Button" },
      { id: "iconbutton", label: "IconButton" },
      { id: "chip", label: "Chip" },
      { id: "tag", label: "Tag" },
      { id: "dot", label: "Dot et statut" },
      { id: "avatar", label: "Avatar" },
      { id: "card", label: "Card" },
      { id: "input", label: "Input" },
      { id: "banner", label: "Banner" },
      { id: "menu", label: "Menus" },
      { id: "divider", label: "Divider" },
      { id: "calendrier", label: "Calendrier" },
    ],
  },
];

interface Swatch {
  name: string;
  className: string;
  hint?: string;
}

const baseColors: Swatch[] = [
  { name: "background", className: "bg-background", hint: "fond de l'app" },
  { name: "surface", className: "bg-surface", hint: "cartes" },
  {
    name: "surface-container",
    className: "bg-surface-container",
    hint: "sidebar, chips",
  },
  {
    name: "surface-soft",
    className: "bg-surface-soft",
    hint: "zones en pointillés",
  },
  { name: "text", className: "bg-text", hint: "encre" },
  {
    name: "text-secondary",
    className: "bg-text-secondary",
    hint: "texte courant",
  },
  { name: "muted", className: "bg-muted", hint: "libellés, heures" },
];

const brandColors: Swatch[] = [
  {
    name: "brand-primary",
    className: "bg-brand-primary",
    hint: "action principale",
  },
  {
    name: "brand-primary-strong",
    className: "bg-brand-primary-strong",
    hint: "liens, survol",
  },
  { name: "brand-dark", className: "bg-brand-dark", hint: "action secondaire" },
];

const stateColors: Swatch[] = [
  { name: "success", className: "bg-success" },
  { name: "success-bg", className: "bg-success-bg" },
  { name: "warning", className: "bg-warning" },
  { name: "warning-bg", className: "bg-warning-bg" },
  { name: "error", className: "bg-error" },
  { name: "error-bg", className: "bg-error-bg" },
  { name: "info", className: "bg-info" },
  { name: "info-bg", className: "bg-info-bg" },
];

const bandColors: Swatch[] = [
  { name: "band-1", className: "bg-band-1", hint: "pierre" },
  { name: "band-2", className: "bg-band-2", hint: "argile" },
  { name: "band-3", className: "bg-band-3", hint: "sauge" },
  { name: "band-4", className: "bg-band-4", hint: "brume" },
  { name: "band-5", className: "bg-band-5", hint: "ardoise" },
];

const avatarColors: AvatarColor[] = ["1", "2", "3", "4", "5", "6", "7"];

/* ------------------------------------------------------------- helpers */

interface SectionProps {
  id: string;
  name: string;
  role: string;
  children: ReactNode;
}

function Section({ id, name, role, children }: SectionProps) {
  return (
    <section
      id={id}
      className="flex scroll-mt-6 flex-col gap-5 rounded-lg border border-border bg-surface p-5 shadow-sm md:p-6"
    >
      <div className="flex flex-col gap-1">
        <h2 className="font-mono text-md font-bold text-text">{name}</h2>
        <p className="max-w-prose text-md text-text-secondary">{role}</p>
      </div>
      <Divider />
      <div className="flex flex-col gap-6">{children}</div>
    </section>
  );
}

interface SpecimenProps {
  label: string;
  children: ReactNode;
  className?: string;
}

function Specimen({ label, children, className = "" }: SpecimenProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="font-mono text-xs text-muted">{label}</span>
      <div
        className={`flex flex-wrap items-center gap-3 rounded-md bg-background p-4 ${className}`}
      >
        {children}
      </div>
    </div>
  );
}

function SwatchGrid({ swatches }: { swatches: Swatch[] }) {
  return (
    <div className="grid w-full grid-cols-[repeat(auto-fill,minmax(8.5rem,1fr))] gap-3">
      {swatches.map((swatch) => (
        <div key={swatch.name} className="flex flex-col gap-1.5">
          <div
            className={`h-14 rounded-sm border border-border ${swatch.className}`}
          />
          <span className="font-mono text-xs text-text">{swatch.name}</span>
          {swatch.hint && (
            <span className="text-xs text-muted">{swatch.hint}</span>
          )}
        </div>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------- page */

function DesignSystem() {
  const { t } = useTranslation();
  const [ideaFilter, setIdeaFilter] = useState<IdeaFilter>("all");
  const [selected, setSelected] = useState<DateRange>();

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 md:grid md:grid-cols-[12rem_minmax(0,1fr)] md:gap-10 md:px-8">
        {/* Navigation: sticky column on desktop, scrolling chips on mobile */}
        <nav
          aria-label="Sections du design system"
          className="flex gap-2 overflow-x-auto md:sticky md:top-8 md:flex-col md:gap-5 md:self-start md:overflow-visible"
        >
          {nav.map((group) => (
            <div key={group.group} className="flex gap-2 md:flex-col md:gap-1">
              <span className="hidden px-2 text-xs font-semibold text-muted md:block">
                {group.group}
              </span>
              {group.items.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="shrink-0 rounded-full border border-border-control bg-surface px-3 py-1.5 text-sm font-semibold whitespace-nowrap text-text hover:bg-surface-container md:rounded-sm md:border-0 md:bg-transparent md:py-1"
                >
                  {item.label}
                </a>
              ))}
            </div>
          ))}
        </nav>

        <main className="flex min-w-0 flex-col gap-6">
          <header className="flex flex-col gap-2">
            <Heading level={1} size="xl">
              Design system
            </Heading>
            <Text tone="secondary" className="max-w-prose">
              Palette A, Archivo pour le texte et JetBrains Mono pour les
              valeurs qu'on scanne (dates, montants). Chaque composant de{" "}
              <code className="font-mono">shared/ui</code> avec les variantes
              réellement utilisées dans l'app.
            </Text>
          </header>

          {/* ------------------------------------------------ Fondations */}

          <Section
            id="couleurs"
            name="Couleurs"
            role="Tokens de index.css (@theme). Chaque --color-x donne les classes bg-x, text-x, border-x. On n'utilise jamais une couleur Tailwind brute (red-500…)."
          >
            <Specimen label="base — fonds et textes">
              <SwatchGrid swatches={baseColors} />
            </Specimen>
            <Specimen label="marque — corail et encre">
              <SwatchGrid swatches={brandColors} />
            </Specimen>
            <Specimen label="états — couleur forte + fond pâle">
              <SwatchGrid swatches={stateColors} />
            </Specimen>
            <Specimen label="bandes de voyage — getTravelBandColor(travel.id), en rotation">
              <SwatchGrid swatches={bandColors} />
            </Specimen>
            <Specimen label='avatars — color="1" à "7" (getAvatarColor), "pending" pour une invitation'>
              {avatarColors.map((color) => (
                <div key={color} className="flex flex-col items-center gap-1">
                  <Avatar color={color}>{`A${color}`}</Avatar>
                  <span className="font-mono text-xs text-muted">{color}</span>
                </div>
              ))}
              <div className="flex flex-col items-center gap-1">
                <Avatar color="pending">IN</Avatar>
                <span className="font-mono text-xs text-muted">pending</span>
              </div>
            </Specimen>
            <Specimen label="types d'idée — pas de couleur, une icône par type (ideaIcons)">
              {ideaTypes.map((type) => (
                <Tag
                  key={type}
                  tone="idea"
                  shape="soft"
                  icon={<Icon name={ideaIcons[type]} size={14} />}
                >
                  {t(ideaTypeLabels[type])}
                </Tag>
              ))}
            </Specimen>
            <Specimen label="catégories de dépense — spendingCategoryBands et dotColors">
              {categories.map((category) => (
                <Tag
                  key={category}
                  tone="plain"
                  shape="soft"
                  icon={<Dot className={dotColors[category]} />}
                  className={spendingCategoryBands[category]}
                >
                  {t(spendingCategoryLabels[category])}
                </Tag>
              ))}
            </Specimen>
          </Section>

          <Section
            id="typographie"
            name="Heading · Text"
            role="Heading : level choisit la balise (h1/h2/h3), size la taille visuelle, les deux sont indépendants. Text : tone règle l'importance, size la taille, font la police. Les tailles grandissent d'un cran en desktop."
          >
            <Specimen
              label='Heading size="xl" (titre de page) · "lg" · "md" (défaut) · "sm" (titre de carte) · "xs"'
              className="flex-col items-start!"
            >
              <Heading level={2} size="xl">
                Mes voyages
              </Heading>
              <Heading level={2} size="lg">
                Road trip Suisse
              </Heading>
              <Heading level={2} size="md">
                Interlaken
              </Heading>
              <Heading level={3} size="sm">
                Chalet au bord du lac
              </Heading>
              <Heading level={3} size="xs">
                Hébergement
              </Heading>
            </Specimen>
            <Specimen
              label='Text size="sm" (info secondaire) · "md" (défaut) · "lg" (montant) · "xl" (chiffre clé)'
              className="flex-col items-start!"
            >
              <Text size="sm" tone="muted">
                chacha_test · Interlaken
              </Text>
              <Text size="md">Pas de nuit · 2 idées épinglées</Text>
              <Text size="lg" font="mono" className="font-semibold">
                240 CHF
              </Text>
              <Text size="xl" font="mono" className="font-semibold">
                1 245 CHF
              </Text>
            </Specimen>
            <Specimen
              label='Text tone="primary" (défaut) · "secondary" · "muted" · "success" · "accent"'
              className="flex-col items-start!"
            >
              <Text tone="primary">alee a voté pour le chalet</Text>
              <Text tone="secondary">a voté pour le chalet</Text>
              <Text tone="muted">à l'instant</Text>
              <Text tone="success">Hébergement choisi</Text>
              <Text tone="accent">Nuit à choisir</Text>
            </Specimen>
            <Specimen label='font="mono" pour une valeur qu&apos;on scanne, "sans" pour une phrase qu&apos;on lit'>
              <span className="inline-flex items-center gap-1">
                <Text font="mono" className="font-semibold">
                  120 CHF
                </Text>
                <Text tone="muted">par nuit</Text>
              </span>
            </Specimen>
          </Section>

          <Section
            id="formes"
            name="Formes et ombres"
            role="Rayons --radius-* et ombres --shadow-*. rounded-full pour les pilules (boutons, chips, tags), rounded-md pour les cartes."
          >
            <Specimen label="rounded-sm 10px · rounded-md 14px · rounded-lg 20px · rounded-xl 26px · rounded-full">
              {[
                "rounded-sm",
                "rounded-md",
                "rounded-lg",
                "rounded-xl",
                "rounded-full",
              ].map((radius) => (
                <div key={radius} className="flex flex-col items-center gap-1">
                  <div
                    className={`size-14 border border-border bg-surface ${radius}`}
                  />
                  <span className="font-mono text-xs text-muted">{radius}</span>
                </div>
              ))}
            </Specimen>
            <Specimen label="shadow-sm · shadow-md · shadow-lg · shadow-brand (boutons corail)">
              {["shadow-sm", "shadow-md", "shadow-lg", "shadow-brand"].map(
                (shadow) => (
                  <div
                    key={shadow}
                    className="flex flex-col items-center gap-1"
                  >
                    <div
                      className={`size-14 rounded-md bg-surface ${shadow}`}
                    />
                    <span className="font-mono text-xs text-muted">
                      {shadow}
                    </span>
                  </div>
                ),
              )}
            </Specimen>
          </Section>

          <Section
            id="icones"
            name="Icon"
            role="Sprite SVG unique dans index.html, style arrondi. name = l'id du symbol sans le préfixe i-. La couleur suit le texte parent (classe text-*), la taille est en pixels."
          >
            <Specimen label="couleur héritée · size={14} / {20} (défaut) / {28}">
              <Icon name="pin" />
              <Icon name="heart-f" className="text-brand-primary" />
              <Icon name="check" className="text-success" />
              <Icon name="moon" className="text-muted" />
              <Divider orientation="vertical" />
              <Icon name="van" size={14} />
              <Icon name="van" size={20} />
              <Icon name="van" size={28} />
            </Specimen>
            <Specimen label={`les ${iconNames.length} icônes du sprite`}>
              <div className="grid w-full grid-cols-[repeat(auto-fill,minmax(5.25rem,1fr))] gap-2">
                {iconNames.map((name) => (
                  <div
                    key={name}
                    className="flex flex-col items-center gap-1.5 rounded-sm bg-surface p-2"
                  >
                    <Icon name={name} />
                    <span className="font-mono text-2xs text-muted">
                      {name}
                    </span>
                  </div>
                ))}
              </div>
            </Specimen>
          </Section>

          {/* ----------------------------------------------- Composants */}

          <Section
            id="button"
            name="Button"
            role="Une action avec un texte. primary pour l'action principale d'un écran (une seule), dark pour une action importante dans une ligne, outline pour le reste."
          >
            <Specimen label='variant="primary" · "dark" · "outline" (défaut) · "ghost" · "danger"'>
              <Button
                variant="primary"
                icon={<Icon name="pinplus" size={16} />}
              >
                Épingler une idée
              </Button>
              <Button variant="dark">Choisir</Button>
              <Button variant="outline" icon={<Icon name="edit" size={16} />}>
                Modifier le profil
              </Button>
              <Button variant="ghost" icon={<Icon name="back" size={16} />}>
                Itinéraire
              </Button>
              <Button variant="danger">Supprimer</Button>
            </Specimen>
            <Specimen label='vote — "white" (voté, carte d&apos;idée) · "voted" (voté, ligne) · "outline" / "ghost" (pas voté)'>
              <Button
                variant="white"
                size="xs"
                icon={<Icon name="heart-f" size={14} />}
              >
                3
              </Button>
              <Button
                variant="outline"
                size="xs"
                icon={<Icon name="heart-f" size={14} />}
              >
                0
              </Button>
              <Button
                variant="voted"
                size="xs"
                icon={<Icon name="heart-f" size={14} />}
              >
                2
              </Button>
              <Button
                variant="ghost"
                size="xs"
                icon={<Icon name="heart-f" size={14} />}
              >
                0
              </Button>
            </Specimen>
            <Specimen label='size="xs" (dans une carte ou une ligne) · "sm" (grandit en desktop) · "md" (défaut)'>
              <Button variant="dark" size="xs">
                Voir l'étape
              </Button>
              <Button variant="dark" size="sm">
                Rechercher
              </Button>
              <Button variant="dark" size="md">
                Ajouter une étape
              </Button>
            </Specimen>
          </Section>

          <Section
            id="iconbutton"
            name="IconButton"
            role="Une action évidente sans texte, dans un rond : fermer, options, envoyer. label est obligatoire : c'est le nom lu par les lecteurs d'écran."
          >
            <Specimen label='variant="primary" · "dark" · "outline" (défaut) · "flat" · "ghost" · "danger"'>
              <IconButton
                variant="primary"
                icon={<Icon name="arrow" size={16} />}
                label="Envoyer"
              />
              <IconButton
                variant="dark"
                icon={<Icon name="check" size={16} />}
                label="Accepter"
              />
              <IconButton
                variant="outline"
                icon={<Icon name="x" size={16} />}
                label="Refuser"
              />
              <IconButton
                variant="flat"
                icon={<Icon name="x" size={16} />}
                label="Fermer"
              />
              <IconButton
                variant="ghost"
                icon={<Icon name="trash" size={16} />}
                label="Supprimer"
              />
              <IconButton
                variant="danger"
                icon={<Icon name="trash" size={16} />}
                label="Supprimer"
              />
            </Specimen>
            <Specimen label='size="xs" · "sm" (défaut) · "md" · "lg"'>
              {(["xs", "sm", "md", "lg"] as const).map((size) => (
                <IconButton
                  key={size}
                  size={size}
                  variant="primary"
                  icon={<Icon name="plus" size={16} />}
                  label={`Ajouter (${size})`}
                />
              ))}
            </Specimen>
          </Section>

          <Section
            id="chip"
            name="Chip"
            role="Filtre ou choix sélectionnable, avec un état actif. Une icône (ideaIcons) ou un rond de couleur (Dot + dotColors pour les dépenses) rappelle le type, comme sur les cartes."
          >
            <Specimen label="active — cliquer pour changer la sélection">
              <Chip
                active={ideaFilter === "all"}
                onClick={() => setIdeaFilter("all")}
              >
                Tous
              </Chip>
              {ideaTypes.map((type) => (
                <Chip
                  key={type}
                  active={ideaFilter === type}
                  onClick={() => setIdeaFilter(type)}
                  icon={<Icon name={ideaIcons[type]} size={16} />}
                >
                  {t(ideaTypeLabels[type])}
                </Chip>
              ))}
            </Specimen>
          </Section>

          <Section
            id="tag"
            name="Tag"
            role='Repère factuel, jamais cliquable : date, nuits, statut, type. Hauteur fixe, sur une seule ligne. Les couleurs des catégories de dépense viennent de spendingCategoryBands avec tone="plain".'
          >
            <Specimen label='tone="default" (défaut, dates d&apos;une invitation) · "muted" (invitation en attente) · "idea" (idées d&apos;une étape)'>
              <Tag>20 – 27 nov.</Tag>
              <Tag tone="muted">Invitation en attente</Tag>
              <Tag tone="idea">2 idées</Tag>
            </Specimen>
            <Specimen label='hébergement d&apos;une étape — tone="todo" (nuits à trouver) puis "plain" + bg-idea-lodging-bg (complet)'>
              <Tag tone="todo" icon={<Icon name="tent" size={13} />}>
                1/2 nuits
              </Tag>
              <Tag
                tone="plain"
                className="bg-idea-lodging-bg text-idea-lodging"
                icon={<Icon name="tent" size={13} />}
              >
                2/2 nuits
              </Tag>
            </Specimen>
            <Specimen
              label='tone="light" — sur une bande de couleur'
              className="bg-band-2!"
            >
              <Tag tone="light">20 – 23 nov.</Tag>
              <Tag tone="light">3 nuits</Tag>
            </Specimen>
            <Specimen
              label='tone="inverse" — sur fond foncé'
              className="bg-brand-dark!"
            >
              <Tag tone="inverse">20 – 27 nov.</Tag>
              <Tag tone="inverse" icon={<Icon name="car" size={14} />}>
                219 km
              </Tag>
            </Specimen>
            <Specimen label='tone="plain" + className — couleur d&apos;un tableau (spendingCategoryBands) ou sur mesure'>
              <Tag
                tone="plain"
                shape="soft"
                className={spendingCategoryBands.f}
              >
                {t(spendingCategoryLabels.f)}
              </Tag>
              <Tag tone="plain" className="bg-success-bg text-success-text">
                Réservé
              </Tag>
            </Specimen>
            <Specimen label='size="sm" (défaut, cartes et lignes) · "md" (en-têtes) — shape="pill" (défaut) · "soft"'>
              <Tag>sm · pill</Tag>
              <Tag size="md">md · pill</Tag>
              <Tag shape="soft">sm · soft</Tag>
              <Tag size="md" shape="soft">
                md · soft
              </Tag>
            </Specimen>
          </Section>

          <Section
            id="dot"
            name="Dot · OnlineStatus · OnlineDot"
            role="Dot : rond de couleur décoratif (filtres, notifications), la couleur vient de className. OnlineStatus : tag en ligne / hors ligne. OnlineDot : pastille verte sur un avatar, le parent doit être relative."
          >
            <Specimen label="Dot — dotColors (catégories de dépense) ou bande de voyage">
              <Dot className={dotColors.m} />
              <Dot className={dotColors.l} />
              <Dot className={dotColors.f} />
              <Dot className="bg-band-3" />
            </Specimen>
            <Specimen label="OnlineStatus — isOnline={true} / {false}">
              <OnlineStatus isOnline />
              <OnlineStatus isOnline={false} />
            </Specimen>
            <Specimen label="OnlineDot — sur un avatar, seulement si la personne est en ligne">
              <span className="relative">
                <Avatar color="3">LU</Avatar>
                <OnlineDot isOnline />
              </span>
              <span className="relative">
                <Avatar color="2">TI</Avatar>
                <OnlineDot isOnline={false} />
              </span>
            </Specimen>
          </Section>

          <Section
            id="avatar"
            name="Avatar"
            role="Identité d'une personne : photo si elle en a une, sinon initiales sur sa couleur. Dans un voyage, la couleur vient de getAvatarColor(travel.travelers, id) pour être la même partout."
          >
            <Specimen label='size="xs" 20px (à côté d&apos;un nom) · "sm" 28px (lignes, piles) · "md" 36px (défaut, listes) · "lg" 60px (profil)'>
              <Avatar size="xs" color="1">
                AL
              </Avatar>
              <Avatar size="sm" color="2">
                TI
              </Avatar>
              <Avatar size="md">CH</Avatar>
              <Avatar size="lg" color="3">
                LU
              </Avatar>
            </Specimen>
            <Specimen label="pile de voyageurs — sm + ring-2 ring-surface, -space-x-2">
              <div className="flex -space-x-2">
                <Avatar size="sm" className="ring-2 ring-background">
                  CH
                </Avatar>
                <Avatar size="sm" color="1" className="ring-2 ring-background">
                  AL
                </Avatar>
                <Avatar size="sm" color="2" className="ring-2 ring-background">
                  TI
                </Avatar>
                <Avatar
                  size="sm"
                  color="pending"
                  className="ring-2 ring-background"
                >
                  +2
                </Avatar>
              </div>
            </Specimen>
          </Section>

          <Section
            id="card"
            name="Card"
            role="Conteneur d'un bloc. band ajoute une bande de couleur en haut (voyage, idée, catégorie) ; className s'applique alors au corps de la carte."
          >
            <Specimen label="band + bandClassName — carte d'idée (neutre, foncée si choisie), carte de voyage">
              <div className="grid w-full gap-3 md:grid-cols-2">
                <Card
                  band={
                    <span className="flex items-center gap-1.5 text-xs font-semibold">
                      <Icon name="tent" size={14} />
                      {t("idea.chosenLodging")}
                      <Icon name="check" size={13} />
                    </span>
                  }
                  bandClassName="bg-brand-dark text-inverse"
                  className="flex flex-col gap-1"
                >
                  <Heading level={3} size="sm">
                    Chalet au bord du lac
                  </Heading>
                  <Text size="sm" tone="muted">
                    chacha_test · Interlaken
                  </Text>
                </Card>
                <Card
                  interactive
                  band={<Tag tone="light">Dans 10 jours</Tag>}
                  bandClassName="bg-band-2"
                  className="flex flex-col gap-1"
                >
                  <Heading level={3} size="sm">
                    Road trip Suisse
                  </Heading>
                  <Text size="sm" tone="muted">
                    20 – 27 nov. · 7 nuits
                  </Text>
                </Card>
              </div>
            </Specimen>
            <Specimen
              label='variant="default" (défaut) · interactive · "dark" · "accommodation" · "alert" · "dashed" · "dashed-accent"'
              className="grid! grid-cols-1 md:grid-cols-2"
            >
              <Card>Carte normale</Card>
              <Card interactive>Carte cliquable (survol)</Card>
              <Card variant="dark">Total du voyage</Card>
              <Card variant="accommodation">Hébergement choisi</Card>
              <Card variant="alert">2 nuits sans hébergement</Card>
              <Card variant="dashed">2 nuits sans étape</Card>
              <Card variant="dashed-accent">Nuit à choisir</Card>
            </Specimen>
          </Section>

          <Section
            id="input"
            name="Input"
            role='Champ d&apos;une ligne. variant="mono" pour les dates et montants, icon pour une action dans le champ.'
          >
            <Specimen
              label='variant="default" · "mono" · avec icône'
              className="flex-col items-stretch!"
            >
              <Input placeholder="Nom du lieu" />
              <Input variant="mono" placeholder="12.08.2026" />
              <Input
                placeholder="Ajouter un ami · pseudo"
                icon={<Icon name="search" size={18} className="text-muted" />}
              />
            </Specimen>
            <Specimen
              label="bouton dans le champ — form relative, bouton absolute, pr-28 sur le champ"
              className="flex-col items-stretch!"
            >
              <form className="relative" onSubmit={(e) => e.preventDefault()}>
                <Input
                  placeholder="Ajouter un ami · pseudo"
                  inputClassName="pr-28"
                  icon={<Icon name="search" size={18} className="text-muted" />}
                />
                <Button
                  type="submit"
                  variant="dark"
                  size="sm"
                  className="absolute top-1/2 right-2 -translate-y-1/2 md:px-3! md:py-2! md:text-xs!"
                >
                  Rechercher
                </Button>
              </form>
            </Specimen>
          </Section>

          <Section
            id="banner"
            name="Banner"
            role="Message pleine largeur en haut de page : hors ligne (OfflineBanner) ou erreur globale (ErrorBanner, affichée 5 s via useError)."
          >
            <Specimen
              label='variant="warning" · "error"'
              className="flex-col items-stretch!"
            >
              <Banner
                variant="warning"
                icon={<Icon name="wifi-off" size={16} />}
              >
                Hors ligne : certaines fonctions sont indisponibles
              </Banner>
              <Banner variant="error" icon={<Icon name="info" size={16} />}>
                Impossible de charger le voyage
              </Banner>
            </Specimen>
          </Section>

          <Section
            id="menu"
            name="OptionsMenu · DropdownMenu"
            role="OptionsMenu : bouton ⋯ avec Modifier / Supprimer et des actions en plus (extraActions). DropdownMenu + MenuItem : pour un menu sur mesure, comme les options d'un voyage."
          >
            <Specimen label='OptionsMenu variant="flat" (défaut) · "ghost" (sur une bande ou dans une ligne)'>
              <OptionsMenu onEdit={() => {}} onDelete={() => {}} />
              <OptionsMenu
                variant="ghost"
                onEdit={() => {}}
                onDelete={() => {}}
                extraActions={[
                  {
                    icon: "check",
                    label: "Choisir cet hébergement",
                    onClick: () => {},
                  },
                ]}
              />
            </Specimen>
            <Specimen label="DropdownMenu + MenuItem — menu sur mesure">
              <DropdownDemo />
            </Specimen>
          </Section>

          <Section
            id="divider"
            name="Divider"
            role="Trait de séparation entre deux blocs."
          >
            <Specimen label='orientation="horizontal" (défaut) · "vertical"'>
              <div className="w-full">
                <Divider />
              </div>
              <Text tone="muted">Jour 1</Text>
              <Divider orientation="vertical" />
              <Text tone="muted">Montreux</Text>
            </Specimen>
          </Section>

          <Section
            id="calendrier"
            name="DatePicker"
            role="Choix d'une plage de dates sur deux mois (ajout d'étape, dates d'une idée)."
          >
            <Specimen label="mode plage">
              <Card className="flex w-full justify-center">
                <DatePicker selected={selected} onSelect={setSelected} />
              </Card>
            </Specimen>
          </Section>
        </main>
      </div>
    </div>
  );
}

export default DesignSystem;
