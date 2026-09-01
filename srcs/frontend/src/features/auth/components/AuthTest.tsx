import { useAuth } from "../context/AuthContext";

export default function AuthTest() {
  const {
    currentUser,
    isLoading,
    login,
    logout,
    refreshUser,
  } = useAuth();

  if (isLoading) {
    return <div>Chargement de l'authentification...</div>;
  }

  return (
    <div className="p-4">
      <h1>Auth Testt</h1>

      {currentUser ? (
        <div>
          <p>
            Connecté en tant que :{" "}
            <strong>{currentUser.username}</strong>
          </p>

          <p>
            ID : {currentUser.id}
          </p>

          <button onClick={logout}>
            Déconnexion React
          </button>

          <button onClick={refreshUser}>
            Rafraîchir utilisateur
          </button>
        </div>
      ) : (
        <div>
          <p>Non connecté</p>

          <button
            onClick={() =>
              login("alice_test", "TestPassword123!")
            }
          >
            Connexion Alice
          </button>
        </div>
      )}
    </div>
  );
}
