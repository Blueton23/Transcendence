import { Link } from "react-router";
import { useTranslation } from "react-i18next";

import Icon from "@/shared/ui/Icon";

// "Back" link shown at the top left of the pages outside the app
// (login, sign up, legal pages).
export function BackLink({ to }: { to: string }) {
  const { t } = useTranslation();
  return (
    <Link
      to={to}
      className="flex w-fit items-center gap-2 text-sm font-semibold text-text-secondary hover:text-text"
    >
      <Icon name="back" size={16} />
      {t("actions.back")}
    </Link>
  );
}
