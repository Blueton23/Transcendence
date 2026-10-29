import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

import Button from "@/shared/ui/Button";
import Input from "@/shared/ui/Input";
import { useSubmitAction } from "@/shared/hooks/useSubmitAction";

import { modifyProfile } from "../api/profile";
import { useAuth } from "@/features/auth/context/useAuth";
import ModifyPassword from "./ModifyPassword";
import ProfilePicture from "./ProfilePicture";
import { useTranslation } from "react-i18next";

interface ModifyProps {
  onSuccess: () => void;
}

function Modify({ onSuccess }: ModifyProps) {
  const { currentUser, setCurrentUser } = useAuth();
  const { t } = useTranslation();

  const [form, setForm] = useState({
    firstName: currentUser?.firstName ?? "",
    lastName: currentUser?.lastName ?? "",
    username: currentUser?.username ?? "",
    email: currentUser?.email ?? "",
  });

  const { submit, isSubmitting, error } = useSubmitAction(() =>
    modifyProfile(form),
  );

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = await submit();

    if (result.success && result.data) {
      setCurrentUser(result.data.traveler);
      onSuccess();
    }
  }

  if (!currentUser) {
    return null;
  }

  return (
    <div className="w-full">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4"
        id="modify-profile-form"
      >
        {/* Photo de profil */}
        <div className="flex items-center justify-start gap-3">
          <ProfilePicture />
        </div>

        {/* Pseudo */}
        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-text-secondary">
            {t("auth.username")}
          </span>

          <Input
            name="username"
            type="text"
            value={form.username}
            onChange={handleChange}
            variant="mono"
            required
          />
        </label>

        {/* Email */}
        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-text-secondary">
            {t("profile.email")}
          </span>

          <Input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </label>

        {/* Prénom / Nom */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-text-secondary">
              {t("profile.firstName")}
            </span>

            <Input
              name="firstName"
              type="text"
              value={form.firstName}
              onChange={handleChange}
              required
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-text-secondary">
              {t("profile.lastName")}
            </span>

            <Input
              name="lastName"
              type="text"
              value={form.lastName}
              onChange={handleChange}
              required
            />
          </label>
        </div>

        {/* Erreur */}
        {error && (
          <p className="text-sm font-medium whitespace-pre-line text-red-500">
            {error}
          </p>
        )}
      </form>

      {/* Mot de passe */}
      <div className="mt-6">
        <ModifyPassword />
      </div>

      {/* Bouton principal */}
      <div className="mt-4">
        <Button
          type="submit"
          form="modify-profile-form"
          variant="primary"
          className="w-full rounded-full py-3"
          disabled={isSubmitting}
        >
          {isSubmitting ? `${t("actions.saving")}` : `${t("actions.save")}`}
        </Button>
      </div>
    </div>
  );
}

export default Modify;
