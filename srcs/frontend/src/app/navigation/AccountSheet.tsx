import { LanguageSwitcher } from "@/app/navigation/LanguageSwitcher";
import { useAuth } from "@/features/auth/context/useAuth";
import { useEscapeKey } from "@/shared/hooks/useEscapeKey";
import { useOnClickOutside } from "@/shared/hooks/useOnClickOutside";
import { useSubmitAction } from "@/shared/hooks/useSubmitAction";
import Avatar from "@/shared/ui/Avatar";
import Button from "@/shared/ui/Button";
import Divider from "@/shared/ui/Divider";
import Icon from "@/shared/ui/Icon";
import IconButton from "@/shared/ui/IconButton";
import Text from "@/shared/ui/Text";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

export function AccountSheet({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const { currentUser, logout } = useAuth();
  const { submit, isSubmitting } = useSubmitAction(logout);
  const sheetRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(sheetRef, onClose);
  useEscapeKey(onClose);

  if (!currentUser) return null;

  const rowStyle =
    "flex min-h-13 items-center justify-between px-1.5 font-semibold text-text";
  const legalStyle =
    "flex min-h-11 items-center px-1.5 text-sm text-text-secondary";

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-scrim md:hidden">
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label={t("nav.account")}
        className="flex w-full flex-col gap-1 rounded-t-3xl bg-surface-control px-4 pt-2.5 pb-6"
      >
        <div className="flex items-center gap-3 border-b border-border px-1 py-3">
          <Avatar size="lg" />
          <div className="flex min-w-0 flex-1 flex-col">
            <Text className="truncate font-bold">
              {currentUser.firstName} {currentUser.lastName}
            </Text>
            <Text size="sm" tone="secondary">
              {currentUser.username}
            </Text>
          </div>
          <IconButton
            variant="flat"
            label={t("actions.close")}
            icon={<Icon name="x" size={16} />}
            onClick={onClose}
          />
        </div>

        <Link to="/travel" onClick={onClose} className={rowStyle}>
          <div className="flex items-center gap-3">
            <Icon name="home" size={20} />
            {t("nav.trips")}
          </div>
          <Icon name="chev-right" size={20} className="text-text" />
        </Link>
        <Link to="/profile" onClick={onClose} className={rowStyle}>
          <div className="flex items-center gap-3">
            <Icon name="user" size={20} />
            {t("nav.profile")}
          </div>
          <Icon name="chev-right" size={16} />
        </Link>
        <div className={rowStyle}>
          {t("actions.language")}
          <div className="ml-auto">
            <LanguageSwitcher />
          </div>
        </div>

        <Divider className="my-1" />
        <div className="flex justify-between px-1.5">
          <Link
            to="/privacy"
            onClick={onClose}
            className={`underline ${legalStyle}`}
          >
            {t("legal.privacy")}
          </Link>
          <Link
            to="/terms"
            onClick={onClose}
            className={`underline ${legalStyle}`}
          >
            {t("legal.terms")}
          </Link>
        </div>

        <Button
          variant="danger"
          icon={<Icon name="logout" size={20} />}
          onClick={submit}
          disabled={isSubmitting}
          className="mt-2"
        >
          {t("auth.logout")}
        </Button>
      </div>
    </div>
  );
}
