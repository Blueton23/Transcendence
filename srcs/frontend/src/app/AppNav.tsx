import IconBadge from "../shared/ui/IconBadge";
import Heading from "../shared/ui/Heading";
import IconButton from "../shared/ui/IconButton";
import Icon from "../shared/ui/Icon";

export function AppNavDesktop() {
  return (
    <div>
      <div className="flex-col-2 flex items-center gap-4">
        <IconBadge name="compass" />
        <Heading>Peripl</Heading>
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
