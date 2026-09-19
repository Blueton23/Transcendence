import { useState } from "react";
import type { FormEvent } from "react";
import { useSubmitAction } from "@/shared/hooks/useSubmitAction";

import { modifyPassword } from "../api/profile";

import Button from "../../../shared/ui/Button";
import Input from "../../../shared/ui/Input";

export function ModifyPassword() {
  const [form, setForm] = useState({ password: "" });

  const { submit, isSubmitting, error } = useSubmitAction(() =>
    modifyPassword({ password: form.password }),
  );

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
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
      //onSuccess();
    }
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-text-secondary">
            Nouveau Password
          </span>

          <Input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            variant="mono"
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
            {isSubmitting ? "Enregistrement..." : "Changer le password"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default ModifyPassword;
