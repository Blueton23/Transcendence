import { useTranslation } from "react-i18next";

import Heading from "@/shared/ui/Heading";
import Text from "@/shared/ui/Text";
import { Footer } from "@/app/Footer";

interface Section {
  title: string;
  paragraphs?: string[];
  items?: string[];
}

function LegalPage({ doc }: { doc: "privacy" | "terms" }) {
  const { t } = useTranslation();
  const sections = t(`legal.${doc}Page.sections`, {
    returnObjects: true,
  }) as Section[];

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 p-6">
      <Heading level={1} size="lg">
        {t(`legal.${doc}`)}
      </Heading>
      <Text tone="muted" size="sm">
        {t("legal.lastUpdated")}
      </Text>
      <Text tone="secondary">{t(`legal.${doc}Page.intro`)}</Text>

      {sections.map((section) => (
        <section key={section.title} className="flex flex-col gap-2">
          <Heading size="sm">{section.title}</Heading>
          {section.paragraphs?.map((p) => (
            <Text key={p} tone="secondary">
              {p}
            </Text>
          ))}
          <ul className="list-disc pl-5 text-xs text-text-secondary md:text-md">
            {section.items?.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      ))}

      <Footer />
    </main>
  );
}

export default LegalPage;
