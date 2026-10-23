import IconBadge from "../../shared/ui/IconBadge";
import Heading from "../../shared/ui/Heading";
import Button from "../../shared/ui/Button";
import NavPill, { NavPillMobile } from "./NavPill";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";

export function AppNavDesktop() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-4">
        <IconBadge color="brand" name="compass" size="md" />
        <Heading>Peripl</Heading>
      </div>
      <div className="flex flex-col gap-1">
        <NavPill to="/travel" iconName="home" label={t("nav.trips")}></NavPill>
        <NavPill
          to="/profile"
          iconName="user"
          label={t("nav.profile")}
        ></NavPill>
      </div>
      <Button variant="outline" onClick={() => navigate("/")}>
        Accueil
      </Button>
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
