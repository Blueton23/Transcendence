import IconBadge from "../../shared/ui/IconBadge";
import Heading from "../../shared/ui/Heading";
import NavPill from "./NavPill";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

export function AppNavDesktop() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link to="/travel" className="flex items-center gap-4">
          <IconBadge color="brand" name="compass" size="md" />
          <Heading>Peripl</Heading>
        </Link>
      </div>
      <nav aria-label={t("nav.main")} className="flex flex-col gap-1">
        <NavPill to="/travel" iconName="van" label={t("nav.trips")}></NavPill>
        <NavPill
          to="/profile"
          iconName="user"
          label={t("nav.profile")}
        ></NavPill>
      </nav>
    </div>
  );
}

export function AppNavMobile() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-1 justify-center gap-1">
      <NavPill
        to="/travel"
        iconName="van"
        label={t("nav.tripsShort")}
        variant="mobile"
      ></NavPill>
      <NavPill
        to="/profile"
        iconName="user"
        label={t("nav.profile")}
        variant="mobile"
      ></NavPill>
    </div>
  );
}
