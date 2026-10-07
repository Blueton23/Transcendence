import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

import Button from "@/shared/ui/Button";
import Input from "@/shared/ui/Input";
import { useSubmitAction } from "@/shared/hooks/useSubmitAction";

import { modifyProfile } from "../api/profile";
import { useAuth } from "../../auth/context/useAuth";
import ModifyPassword from "./ModifyPassword";
import ProfilePicture from "./ProfilePicture";

interface ModifyProps {
  onSuccess: () => void;
}

function Modify({ onSuccess }: ModifyProps) {
  const { currentUser, setCurrentUser } = useAuth();

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
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Photo de profil */}
        <div className="flex items-center justify-start gap-3">
          <ProfilePicture />
        </div>

        {/* Pseudo */}
        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-text-secondary">
            Pseudo
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
            Email
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
              Prénom
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
              Nom
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
          type="button"
          variant="primary"
          className="w-full rounded-full py-3"
          disabled={isSubmitting}
          onClick={() => {
            const formElement = document.querySelector(
              "form",
            ) as HTMLFormElement | null;

            formElement?.requestSubmit();
          }}
        >
          {isSubmitting ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </div>
    </div>
  );
}

export default Modify;
