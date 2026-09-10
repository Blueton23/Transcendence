import Button from "../shared/ui/Button";
import Heading from "../shared/ui/Heading";
import Text from "../shared/ui/Text";

import { useNavigate } from "react-router";
import { useAuth } from "../features/auth/context/useAuth";

function HomePage() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  async function handleLogout() {
    try {
      await logout();
      console.log("SDU : logout terminé");
    } catch (error) {
      console.error("Erreur lors de la déconnexion :", error);
    }
  }

  const isConnected = currentUser !== null;

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="absolute top-6 left-6 flex items-center gap-2">
        <span
          className={`h-3 w-3 rounded-full ${isConnected ? "bg-green-500" : "bg-gray-400"}`}
        />
        <Text tone="secondary">
          {" "}
          {isConnected ? currentUser.username : "Déconnecté"}{" "}
        </Text>
      </div>

      <div className="flex w-full max-w-3xl flex-col items-center gap-6 text-center">
        <div className="flex flex-col gap-2">
          <Heading level={1} size="lg">
            Accueil
          </Heading>
          <Text tone="secondary">Page temporaire SDU</Text>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <Button variant="primary" onClick={() => navigate("/signup")}>
            Créer un compte
          </Button>

          <Button variant="outline" onClick={() => navigate("/login")}>
            Se connecter
          </Button>

          <Button variant="outline" onClick={handleLogout}>
            Se déconnecter
          </Button>
          <Button variant="outline" onClick={() => navigate("/profile")}>
            Profil
          </Button>
        </div>
      </div>
    </main>
  );
}

export default HomePage;
