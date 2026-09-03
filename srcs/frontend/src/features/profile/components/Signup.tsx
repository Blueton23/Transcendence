import { FormEvent, useState } from "react";
import { useNavigate } from "react-router";

import { signup, login } from "../../auth/api/auth";
import { useAuth } from "../../auth/context/AuthContext";

import Button from "../../../shared/ui/Button";
import Heading from "../../../shared/ui/Heading";
import Input from "../../../shared/ui/Input";

function SignupPage() {
  const navigate = useNavigate();
  const { setCurrentUser } = useAuth();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);

    if (form.password !== form.password_confirmation) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    if (form.password.length < 8) {
      setError(
        "Le mot de passe doit contenir au moins 8 caractères.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      await signup({
        first_name: form.first_name,
        last_name: form.last_name,
        username: form.username,
        email: form.email,
        password: form.password,
      });

      const loginResponse = await login({
        username: form.username,
        password: form.password,
      });

      setCurrentUser(loginResponse.traveler);

      navigate("/profile");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Une erreur est survenue.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface">
          <span className="text-xl">✦</span>
        </div>

        <Heading level={2} size="md">
          Créer un compte
        </Heading>
      </div>

      {/* Formulaire */}
      <form
        onSubmit={handleSubmit}
        className="mt-7 flex flex-col gap-4"
      >
        {/* Prénom / Nom */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-text-secondary">
              Prénom
            </span>

            <Input
              name="first_name"
              type="text"
              value={form.first_name}
              onChange={handleChange}
              required
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-text-secondary">
              Nom
            </span>

            <Input
              name="last_name"
              type="text"
              value={form.last_name}
              onChange={handleChange}
              required
            />
          </label>
        </div>

        {/* Nom d'utilisateur */}
        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-text-secondary">
            Nom d'utilisateur
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

        {/* Mot de passe */}
        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-text-secondary">
            Mot de passe
          </span>

          <Input
            name="password"
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
            name="password_confirmation"
            type="password"
            value={form.password_confirmation}
            onChange={handleChange}
            variant="mono"
            minLength={8}
            required
          />
        </label>

        {/* Erreur */}
        {error && (
          <p className="text-sm font-medium text-red-500">
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
              ? "Création..."
              : "Créer mon compte"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default SignupPage;
