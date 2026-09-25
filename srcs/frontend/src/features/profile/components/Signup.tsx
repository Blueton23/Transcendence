import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router";

import { signup } from "../api/profile";
import { login } from "../../auth/api/auth";
import { useAuth } from "../../auth/context/useAuth";
import type { SignupData } from "../types";

import { useSubmitAction } from "@/shared/hooks/useSubmitAction";
import Button from "@/shared/ui/Button";
import Heading from "@/shared/ui/Heading";
import Input from "@/shared/ui/Input";
import Icon from "@/shared/ui/Icon";
import IconBadge from "@/shared/ui/IconBadge";
import Text from "@/shared/ui/Text";

const INITIAL_FORM: SignupData = {
  firstName: "",
  lastName: "",
  username: "",
  email: "",
  password: "",
  passwordConfirmation: "",
};

function Signup() {
  const navigate = useNavigate();
  const { setCurrentUser } = useAuth();
  const [form, setForm] = useState<SignupData>(INITIAL_FORM);

  const { submit, isSubmitting, error } = useSubmitAction(() => signup(form));

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
      const loginResult = await login({
        username: form.username,
        password: form.password,
      });

      setCurrentUser(loginResult.traveler);
      navigate("/profile");
    }
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col items-center gap-2 text-center">
        <IconBadge color="purple" name="mtn" />

        <Heading level={1} size="lg">
          Créer un compte
        </Heading>

        <Text tone="secondary">Rejoignez vos futurs road trips</Text>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-4">
        {/* Prénom / Nom */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-text-secondary">
              Prénom
            </span>

            <Input
              name="firstName"
              icon={
                <Icon name="user" size={18} className="text-brand-primary" />
              }
              placeholder="Charlotte"
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
              icon={
                <Icon name="user" size={18} className="text-brand-primary" />
              }
              placeholder="Petit"
              type="text"
              value={form.lastName}
              onChange={handleChange}
              required
            />
          </label>
        </div>

        {/* Pseudo */}
        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-text-secondary">
            Pseudo
          </span>

          <Input
            name="username"
            icon={<Icon name="user" size={18} className="text-brand-primary" />}
            placeholder="charlotte.p"
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
            icon={
              <Icon name="email" size={18} className="text-brand-primary" />
            }
            placeholder="charlotte@peripl.com"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </label>

        {/* Mot de passe */}
        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-text-secondary">
            Mot de passe
          </span>

          <Input
            name="password"
            icon={<Icon name="lock" size={18} className="text-brand-primary" />}
            placeholder="••••••••"
            type="password"
            value={form.password}
            onChange={handleChange}
            variant="mono"
            minLength={8}
            required
          />
        </label>

        {/* Confirmation du mot de passe */}
        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-text-secondary">
            Confirmer le mot de passe
          </span>

          <Input
            name="passwordConfirmation"
            icon={<Icon name="lock" size={18} className="text-brand-primary" />}
            placeholder="••••••••"
            type="password"
            value={form.passwordConfirmation}
            onChange={handleChange}
            variant="mono"
            minLength={8}
            required
          />
        </label>

        {/* Erreur */}
        {error && <p className="text-sm font-medium text-red-500">{error}</p>}

        {/* Bouton */}
        <div className="mt-3">
          <Button
            type="submit"
            variant="primary"
            className="w-full rounded-full py-3"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Création..." : "Créer mon compte"}
          </Button>
        </div>
        {/* Lien vers la connexion */}
        <div className="flex items-center justify-center gap-1 text-sm">
          <Text tone="muted">Déjà un compte ?</Text>

          <button
            type="button"
            onClick={() => navigate("/login")}
            className="font-medium text-brand-primary hover:underline"
          >
            Se connecter
          </button>
        </div>
      </form>
    </div>
  );
}

export default Signup;
