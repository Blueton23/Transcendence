import IconBadge from "../../shared/ui/IconBadge";
import Heading from "../../shared/ui/Heading";
import NavPill, { NavPillMobile } from "./NavPill";

export function AppNavDesktop() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-4">
        <IconBadge color="brand" name="compass" size="md" />
        <Heading>Peripl</Heading>
      </div>
      <div className="flex flex-col gap-1">
        <NavPill to="/trip" iconName="home" label="Mes voyages"></NavPill>
        <NavPill to="/profil" iconName="user" label="Profil"></NavPill>
      </div>
    </div>
  );
}

export function AppNavMobile() {
  return (
    <div className="flex gap-1">
      <NavPillMobile to="/trip" iconName="home"></NavPillMobile>
      <NavPillMobile to="/profil" iconName="user"></NavPillMobile>
    </div>
  );
}
