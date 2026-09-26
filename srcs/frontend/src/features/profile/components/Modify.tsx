import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

import Button from "@/shared/ui/Button";
import Input from "@/shared/ui/Input";
import Avatar from "@/shared/ui/Avatar";
import { useSubmitAction } from "@/shared/hooks/useSubmitAction";

import { modifyProfile } from "../api/profile";
import { useAuth } from "../../auth/context/useAuth";
import ModifyPassword from "./ModifyPassword";

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
        {/* Avatar */}
        <div className="flex w-24 justify-center">
          <Avatar size="lg" color="1">
            {currentUser.firstName?.charAt(0).toUpperCase()}
            {currentUser.lastName?.charAt(0).toUpperCase()}
          </Avatar>
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

        {/* Bouton */}
        <div className="mt-3">
          <Button
            type="submit"
            variant="primary"
            className="w-full rounded-full py-3"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Enregistrement..."
              : "Enregistrer les modifications"}
          </Button>
        </div>
      </form>
      {/* Password */}
      <ModifyPassword />
    </div>
  );
}

export default Modify;
