import type { ReactNode } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";

import { useAuth } from "@/features/auth/context/useAuth";
import { Footer } from "@/app/Footer";
import { LanguageSwitcher } from "@/app/navigation/LanguageSwitcher";
import Avatar from "@/shared/ui/Avatar";
import Button from "@/shared/ui/Button";
import Card from "@/shared/ui/Card";
import Heading from "@/shared/ui/Heading";
import Icon, { type IconName } from "@/shared/ui/Icon";
import IconBadge from "@/shared/ui/IconBadge";
import Tag from "@/shared/ui/Tag";
import Text from "@/shared/ui/Text";

/* Landing page for visitors. A logged-in user goes straight to their trips. */

const features: {
  key: "itinerary" | "ideas" | "expenses" | "chat";
  icon: IconName;
  band: string;
}[] = [
  {
    key: "itinerary",
    icon: "route",
    band: "bg-band-2 text-brand-primary-strong",
  },
  {
    key: "ideas",
    icon: "pinplus",
    band: "bg-idea-lodging-bg text-idea-lodging",
  },
  {
    key: "expenses",
    icon: "cash",
    band: "bg-idea-activity-bg text-idea-activity",
  },
  {
    key: "chat",
    icon: "chat",
    band: "bg-idea-restaurant-bg text-idea-restaurant",
  },
];

const steps = ["create", "invite", "decide"] as const;

function Logo({ small = false }: { small?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <IconBadge color="brand" name="compass" size={small ? "sm" : "md"} />
      <span className={`font-extrabold ${small ? "text-md" : "text-lg"}`}>
        Peripl
      </span>
    </Link>
  );
}

function Section({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`px-4 py-10 md:px-12 md:py-16 ${className}`}>
      <div className="mx-auto flex max-w-6xl flex-col gap-6 md:gap-8">
        {children}
      </div>
    </section>
  );
}

/* Decorative preview of the app, built from the real components. */
function AppPreview() {
  const { t } = useTranslation();
  const previewSteps = [
    { n: 1, city: "Genève", date: "20 → 21", lodging: "1/1", done: true },
    { n: 2, city: "Lausanne", date: "21 → 23", lodging: "0/2", done: false },
    { n: 3, city: "Interlaken", date: "24 → 25", lodging: "1/1", done: true },
  ];

  return (
    <div
      aria-hidden="true"
      className="relative mx-auto w-full max-w-[28rem] px-2 pt-10 pb-12 md:px-8"
    >
      <Card
        band={
          <>
            <Tag tone="light">{t("home.preview.inDays")}</Tag>
            <div className="ml-auto flex -space-x-2">
              <Avatar size="sm" className="ring-2 ring-band-2">
                CH
              </Avatar>
              <Avatar size="sm" color="1" className="ring-2 ring-band-2">
                AL
              </Avatar>
              <Avatar size="sm" color="2" className="ring-2 ring-band-2">
                TI
              </Avatar>
            </div>
          </>
        }
        bandClassName="bg-band-2"
        className="flex flex-col gap-2"
      >
        <Heading level={2} size="md">
          {t("home.preview.trip")}
        </Heading>
        <Text size="sm" tone="secondary" className="-mt-1">
          {t("home.preview.tripInfo")}
        </Text>
        {previewSteps.map((step) => (
          <div
            key={step.n}
            className="flex items-center gap-2.5 rounded-sm bg-background px-2.5 py-2"
          >
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-dark text-xs font-bold text-inverse">
              {step.n}
            </span>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-md font-bold">{step.city}</span>
              <span className="font-mono text-xs text-text-secondary">
                {step.date}
              </span>
            </span>
            <Tag
              tone={step.done ? "plain" : "todo"}
              shape="soft"
              icon={<Icon name="tent" size={13} />}
              className={
                step.done ? "bg-idea-lodging-bg text-idea-lodging" : ""
              }
            >
              {step.lodging}
            </Tag>
          </div>
        ))}
      </Card>

      <div className="absolute -top-6 right-0 w-60 rotate-3 shadow-lg md:-right-4">
        <Card
          band={
            <span className="flex items-center gap-1 text-xs font-semibold">
              <Icon name="check" size={13} />
              {t("idea.chosenLodging")}
            </span>
          }
          bandClassName="bg-idea-lodging-bg text-idea-lodging"
          className="flex items-start justify-between gap-2"
        >
          <Text className="font-bold">{t("home.preview.idea")}</Text>
          <Text font="mono" className="font-semibold whitespace-nowrap">
            120 CHF
          </Text>
        </Card>
      </div>

      <div className="absolute -bottom-2 left-0 flex -rotate-2 items-center gap-2.5 rounded-md bg-brand-dark px-3.5 py-2.5 text-inverse shadow-lg md:-left-2">
        <Avatar size="sm" color="1">
          AL
        </Avatar>
        <Icon name="arrow" size={14} className="opacity-70" />
        <Avatar size="sm" className="ring-2 ring-surface">
          CH
        </Avatar>
        <span className="flex flex-col">
          <span className="text-xs opacity-75">
            {t("home.preview.settlement")}
          </span>
          <span className="font-mono text-md">95 CHF</span>
        </span>
      </div>
    </div>
  );
}

function HomePage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { t } = useTranslation();

  if (currentUser) {
    return <Navigate to="/travel" replace />;
  }

  const signupButton = (
    <Button variant="primary" onClick={() => navigate("/signup")}>
      {t("home.signup")}
    </Button>
  );

  return (
    <div className="min-h-screen bg-background text-text">
      <header className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-4 md:px-12">
        <Logo />
        <div className="ml-auto hidden md:block">
          <LanguageSwitcher />
        </div>
        <Button
          variant="outline"
          size="sm"
          className="ml-auto md:ml-0"
          onClick={() => navigate("/login")}
        >
          {t("auth.login")}
        </Button>
        <div className="hidden md:block">
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate("/signup")}
          >
            {t("home.signup")}
          </Button>
        </div>
      </header>

      <main>
        <Section className="pt-6! md:pt-10!">
          <div className="grid items-center gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] md:gap-12">
            <div className="flex flex-col items-start gap-5">
              <Tag tone="muted" className="tracking-wider uppercase">
                {t("home.tagline")}
              </Tag>
              <Heading
                level={1}
                className="text-4xl! leading-[1.05] tracking-tight md:text-6xl!"
              >
                {t("home.title")}{" "}
                <span className="text-brand-primary">
                  {t("home.titleHighlight")}
                </span>
              </Heading>
              <Text size="lg" tone="secondary" className="max-w-144">
                {t("home.subtitle")}
              </Text>
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                {signupButton}
                <Button
                  variant="outline"
                  icon={<Icon name="google" size={18} />}
                  onClick={() => {
                    window.location.href = "/api/auth/google/";
                  }}
                >
                  {t("auth.continueWithGoogle")}
                </Button>
              </div>
            </div>
            <AppPreview />
          </div>
        </Section>

        <Section className="bg-surface-container">
          <div className="flex flex-col gap-2">
            <Heading level={2} size="xl">
              {t("home.featuresTitle")}
            </Heading>
            <Text size="lg" tone="secondary">
              {t("home.featuresSubtitle")}
            </Text>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Card
                key={feature.key}
                band={
                  <span className="flex items-center gap-2 font-bold">
                    <Icon name={feature.icon} size={20} />
                    {t(`nav.${feature.key}`)}
                  </span>
                }
                bandClassName={`py-3! ${feature.band}`}
              >
                <Text tone="secondary" size="lg">
                  {t(`home.features.${feature.key}`)}
                </Text>
              </Card>
            ))}
          </div>
        </Section>

        <Section>
          <Heading level={2} size="xl">
            {t("home.stepsTitle")}
          </Heading>
          <ol className="grid gap-6 md:grid-cols-3 md:gap-8">
            {steps.map((step, index) => (
              <li key={step} className="flex gap-4 md:flex-col md:gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-dark font-mono text-md text-inverse">
                  {index + 1}
                </span>
                <span className="flex flex-col gap-1">
                  <Heading level={3} size="sm">
                    {t(`home.steps.${step}.title`)}
                  </Heading>
                  <Text tone="secondary" size="lg">
                    {t(`home.steps.${step}.text`)}
                  </Text>
                </span>
              </li>
            ))}
          </ol>
        </Section>

        <Section className="pt-0!">
          <Card
            variant="dark"
            className="flex flex-col items-start gap-4 p-6! md:flex-row md:items-center md:justify-between md:p-10!"
          >
            <div className="flex flex-col gap-1">
              <Heading level={2} size="xl" className="text-inverse!">
                {t("home.ctaTitle")}
              </Heading>
              <Text size="lg" className="text-inverse/75!">
                {t("home.ctaText")}
              </Text>
            </div>
            {signupButton}
          </Card>
        </Section>
      </main>

      <footer className="mx-auto flex max-w-6xl flex-col items-center gap-4 border-t border-border px-4 py-8 md:flex-row md:justify-between md:px-12">
        <div className="flex items-center gap-3">
          <Logo small />
          <Text size="sm" tone="muted">
            {t("home.project")}
          </Text>
        </div>
        <Footer />
      </footer>
    </div>
  );
}

export default HomePage;
