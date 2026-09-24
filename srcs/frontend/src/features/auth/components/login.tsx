import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router";

import { login } from "../api/auth";
import { useAuth } from "../context/useAuth";
import { useSubmitAction } from "@/shared/hooks/useSubmitAction";

import Button from "../../../shared/ui/Button";
import Card from "../../../shared/ui/Card";
import Heading from "../../../shared/ui/Heading";
import Input from "../../../shared/ui/Input";
import Text from "../../../shared/ui/Text";

function Login() {
  const navigate = useNavigate();
  const { setCurrentUser } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { submit, isSubmitting, error } = useSubmitAction(() =>
    login({ username, password }),
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = await submit();
    if (result.success && result.data) {
      setCurrentUser(result.data.traveler);
      navigate("/profile");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-3xl">
        <Card variant="default">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Heading level={1} size="lg">
                Bon retour
              </Heading>

              <Text tone="secondary">
                Connectez-vous pour retrouver vos voyages
              </Text>
            </div>

            <div className="flex flex-col gap-4">
              <Input
                type="text"
                name="username"
                placeholder="Nom d'utilisateur"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
                required
              />

              <Input
                type="password"
                name="password"
                placeholder="Mot de passe"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            {error && <Text tone="accent">{error}</Text>}

            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? "Connexion..." : "Se connecter"}
            </Button>
          </form>
        </Card>
      </div>
    </main>
  );
}

export default Login;
