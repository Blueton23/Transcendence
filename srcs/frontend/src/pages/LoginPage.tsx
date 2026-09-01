import Connexion from "../features/auth/components/connexion";

function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-3xl">
        <h1 className="text-3xl font-bold mb-6">
          Connexion
        </h1>

        <Connexion />
      </div>
    </main>
  );
}

export default LoginPage;