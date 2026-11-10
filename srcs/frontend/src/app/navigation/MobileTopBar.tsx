import { AccountSheet } from "@/app/navigation/AccountSheet";
import { TravelTitle } from "@/app/navigation/TravelTitle";
import { useTravel } from "@/features/travel/hooks/useTravel";
import Avatar from "@/shared/ui/Avatar";
import Heading from "@/shared/ui/Heading";
import Icon from "@/shared/ui/Icon";
import IconBadge from "@/shared/ui/IconBadge";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router";

function CurrentTravelTitle({ travelId }: { travelId: string }) {
  const { travel } = useTravel(Number(travelId));
  if (!travel) return null;
  return <TravelTitle travel={travel} inverse={true} />;
}

export function MobileTopBar() {
  const { t } = useTranslation();
  const { id: travelId } = useParams();
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  return (
    <header className="flex h-15 shrink-0 items-center gap-2.5 bg-brand-dark px-3 text-inverse md:hidden">
      {travelId ? (
        <>
          <Link
            to="/travel"
            aria-label={t("nav.trips")}
            title={t("nav.trips")}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-control"
          >
            <Icon name="home" size={22} className="text-text" />
          </Link>
          <div className="flex min-w-0 flex-1 justify-center text-center">
            <CurrentTravelTitle travelId={travelId} />
          </div>
        </>
      ) : (
        <div className="flex items-center gap-2.5">
          <IconBadge color="brand" name="compass" />
          <Heading size="sm" className="text-inverse!">
            Peripl
          </Heading>
        </div>
      )}
      <button
        type="button"
        aria-label={t("nav.account")}
        onClick={() => setIsAccountOpen(true)}
        className="ml-auto flex h-11 w-11 shrink-0 items-center justify-center"
      >
        <Avatar className="ring-2 ring-white" />
      </button>
      {isAccountOpen && (
        <AccountSheet onClose={() => setIsAccountOpen(false)} />
      )}
    </header>
  );
}
