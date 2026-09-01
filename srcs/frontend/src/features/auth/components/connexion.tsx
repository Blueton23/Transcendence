import { FormEvent, useState } from "react";
import { useNavigate } from "react-router";

import { login } from "../api/auth";
import { useAuth } from "../context/AuthContext";

function Connexion() {
  const navigate = useNavigate();
  const { setCurrentUser } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);
    setIsSubmitting(true);

    try {
      const response = await login({
        username,
        password,
      });

      setCurrentUser(response.traveler);

      navigate("/profile");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de se connecter.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4"
    >
      <input
        type="text"
        name="username"
        placeholder="Nom d'utilisateur"
        value={username}
        onChange={(event) => setUsername(event.target.value)}
        autoComplete="username"
        required
      />

      <input
        type="password"
        name="password"
        placeholder="Mot de passe"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        autoComplete="current-password"
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
        {isSubmitting ? "Connexion..." : "Se connecter"}
      </button>
    </form>
  );
}

export default Connexion;