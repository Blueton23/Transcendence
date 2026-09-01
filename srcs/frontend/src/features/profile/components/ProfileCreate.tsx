import { FormEvent, useState } from "react";
import { useNavigate } from "react-router";

import { signup, login } from "../../auth/api/auth";
import { useAuth } from "../../auth/context/AuthContext";

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

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
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
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-3xl">
        <h1 className="text-3xl font-bold mb-6">
          Créer un compte
        </h1>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
        >
          <input
            name="first_name"
            type="text"
            placeholder="Prénom"
            value={form.first_name}
            onChange={handleChange}
            required
          />

          <input
            name="last_name"
            type="text"
            placeholder="Nom"
            value={form.last_name}
            onChange={handleChange}
            required
          />

          <input
            name="username"
            type="text"
            placeholder="Nom d'utilisateur"
            value={form.username}
            onChange={handleChange}
            required
          />

          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <input
            name="password"
            type="password"
            placeholder="Mot de passe"
            value={form.password}
            onChange={handleChange}
            minLength={8}
            required
          />

          <input
            name="password_confirmation"
            type="password"
            placeholder="Confirmer le mot de passe"
            value={form.password_confirmation}
            onChange={handleChange}
            minLength={8}
            required
          />

          {error && (
            <p className="text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded px-4 py-2 bg-black text-white disabled:opacity-50"
          >
            {isSubmitting
              ? "Création..."
              : "Créer mon compte"}
          </button>
        </form>
      </div>
    </main>
  );
}

export default SignupPage;