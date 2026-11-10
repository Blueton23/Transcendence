import IconBadge from "../../shared/ui/IconBadge";
import Heading from "../../shared/ui/Heading";
import NavPill, { NavPillMobile } from "./NavPill";
import { useTranslation } from "react-i18next";

export function AppNavDesktop() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <IconBadge color="brand" name="compass" size="md" />
        <Heading>Peripl</Heading>
      </div>
      <nav aria-label={t("nav.main")} className="flex flex-col gap-1">
        <NavPill to="/travel" iconName="home" label={t("nav.trips")}></NavPill>
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
  return (
    <div className="flex gap-1">
      <NavPillMobile to="/travel" iconName="home"></NavPillMobile>
      <NavPillMobile to="/profile" iconName="user"></NavPillMobile>
    </div>
  );
}
