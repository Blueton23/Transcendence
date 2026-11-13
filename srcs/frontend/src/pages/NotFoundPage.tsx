import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";

import { useAuth } from "@/features/auth/context/useAuth";
import { Footer } from "@/app/Footer";
import Button from "@/shared/ui/Button";
import Heading from "@/shared/ui/Heading";
import IconBadge from "@/shared/ui/IconBadge";
import Text from "@/shared/ui/Text";

// Shown for any URL the app does not know (route "*").
function NotFoundPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { t } = useTranslation();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-10 bg-background p-6 text-center">
      <div className="flex flex-col items-center gap-4">
        <IconBadge color="brand" name="compass" size="md" />
        <span className="font-mono text-6xl font-medium text-brand-primary md:text-7xl">
          404
        </span>
        <Heading level={1} size="xl">
          {t("notFound.title")}
        </Heading>
        <Text size="lg" tone="secondary">
          {t("notFound.text")}
        </Text>
        <Button
          variant="primary"
          className="mt-2"
          onClick={() => navigate(currentUser ? "/travel" : "/")}
        >
          {currentUser ? t("notFound.trips") : t("notFound.home")}
        </Button>
      </div>
      <Footer />
    </main>
  );
}

export default NotFoundPage;
