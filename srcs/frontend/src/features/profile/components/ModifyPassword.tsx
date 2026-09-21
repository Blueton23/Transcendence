import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

import { useSubmitAction } from "@/shared/hooks/useSubmitAction";
import Button from "@/shared/ui/Button";
import Input from "@/shared/ui/Input";

import { modifyPassword } from "../api/profile";
import type { ModifyPasswordData } from "../types";

const INITIAL_FORM: ModifyPasswordData = {
  oldPassword: "",
  newPassword1: "",
  newPassword2: "",
};

export function ModifyPassword() {
  const [form, setForm] = useState<ModifyPasswordData>(INITIAL_FORM);

  const { submit, isSubmitting, error } = useSubmitAction(() =>
    modifyPassword(form),
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
    if (result.success) {
      setForm(INITIAL_FORM);
    }
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-text-secondary">
            Ancien mot de passe
          </span>

          <Input
            name="oldPassword"
            type="password"
            value={form.oldPassword}
            onChange={handleChange}
            variant="mono"
            autoComplete="current-password"
            required
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-text-secondary">
            Nouveau mot de passe
          </span>

          <Input
            name="newPassword1"
            type="password"
            value={form.newPassword1}
            onChange={handleChange}
            variant="mono"
            autoComplete="new-password"
            required
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-text-secondary">
            Confirmer le nouveau mot de passe
          </span>

          <Input
            name="newPassword2"
            type="password"
            value={form.newPassword2}
            onChange={handleChange}
            variant="mono"
            autoComplete="new-password"
            required
          />
        </label>

        {error && (
          <p className="text-sm font-medium whitespace-pre-line text-red-500">
            {error}
          </p>
        )}

        <div className="mt-3">
          <Button
            type="submit"
            variant="primary"
            className="w-full rounded-full py-3"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Enregistrement..." : "Changer le mot de passe"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default ModifyPassword;
