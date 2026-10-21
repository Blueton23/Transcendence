import { useState } from "react";
import type { FormEvent } from "react";
import { useLocation, useNavigate } from "react-router";

import { login } from "../api/auth";
import { useAuth } from "../context/useAuth";
import { useSubmitAction } from "@/shared/hooks/useSubmitAction";

import Button from "@/shared/ui/Button";
import Card from "@/shared/ui/Card";
import Heading from "@/shared/ui/Heading";
import Input from "@/shared/ui/Input";
import Text from "@/shared/ui/Text";
import IconBadge from "@/shared/ui/IconBadge";
import Icon from "@/shared/ui/Icon";
import { useTranslation } from "react-i18next";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname ?? "/profile";
  const { setCurrentUser } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { t } = useTranslation();

  const { submit, isSubmitting, error } = useSubmitAction(() =>
    login({ username, password }),
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = await submit();

    if (result.success && result.data) {
      setCurrentUser(result.data.traveler);
      navigate(from, { replace: true });
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-3xl">
        <Card variant="default">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col items-center gap-2 text-center">
              <IconBadge color="purple" name="mtn" />
              <Heading level={1} size="lg">
                ${t("auth.welcomeBack")}
              </Heading>

              <Text tone="secondary">t("auth.loginSubtitle")</Text>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="username"
                  className="text-sm font-medium text-text-secondary"
                >
                  ${t("auth.username")}
                </label>

                <Input
                  id="username"
                  type="text"
                  name="username"
                  icon={
                    <Icon
                      name="user"
                      size={18}
                      className="text-brand-primary"
                    />
                  }
                  placeholder="Charlotte.p"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  autoComplete="username"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-text-secondary"
                >
                  {t("auth.password")}
                </label>

                <Input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  icon={
                    <Icon
                      name="lock"
                      size={18}
                      className="text-brand-primary"
                    />
                  }
                  iconLabel={t("auth.password")}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            {error && <Text tone="accent">{error}</Text>}

            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? t("auth.logginIn") : t("auth.login")}
            </Button>

            <div className="flex items-center justify-center gap-1 text-sm">
              <Text tone="muted">{t("auth.noAccount")}</Text>

              <button
                type="button"
                onClick={() => navigate("/signup")}
                className="font-medium text-brand-primary hover:underline"
              >
                {t("auth.createAccount")}
              </button>
            </div>
          </form>
        </Card>
      </div>
    </main>
  );
}

export default Login;
