import IconBadge from "../shared/ui/IconBadge";
import Heading from "../shared/ui/Heading";
import IconButton from "../shared/ui/IconButton";
import NavPill from "./NavPill";
import Icon from "../shared/ui/Icon";




export function AppNavDesktop() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-4">
        <IconBadge color="brand" name="compass" size="md" />
        <Heading>Peripl</Heading>
      </div>
      <div className="flex flex-col gap-1">
      <NavPill to="/trip" icon={<Icon name="home"/>} label="Mes voyages"></NavPill>
      <NavPill to="/profil" icon={<Icon name="user"/>} label="Profil"></NavPill>
      </div>
    </div>
  );
}

export function AppNavMobile() {
  return (
    <div>
      <IconButton
        variant="ghost"
        className="text-white"
        icon={<Icon name="compass" size={30} />}
      />
    </div>
  );
}
