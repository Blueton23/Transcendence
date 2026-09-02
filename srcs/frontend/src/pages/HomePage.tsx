import Button from "../shared/ui/Button";
import Heading from "../shared/ui/Heading";
import Text from "../shared/ui/Text";

import { useNavigate } from "react-router";
import { useAuth } from "../features/auth/context/AuthContext";


function HomePage() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  async function handleLogout() {
    try {
      await logout();
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Erreur lors de la déconnexion :", error);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-3xl flex flex-col items-center gap-6 text-center">
        <div className="flex flex-col gap-2">
          <Heading level={1} size="lg">
            Accueil
          </Heading>

          <Text tone="secondary">
            Page temporaire SDU
          </Text>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <Button
            variant="primary"
            onClick={() => navigate("/signup")}
          >
            Créer un compte
          </Button>

          <Button
            variant="outline"
            onClick={() => navigate("/login")}
          >
            Se connecter
          </Button>

          <Button
            variant="outline"
            onClick={handleLogout}
          >
            Se déconnecter
          </Button>
        </div>
      </div>
    </main>
  );
}

export default HomePage;
