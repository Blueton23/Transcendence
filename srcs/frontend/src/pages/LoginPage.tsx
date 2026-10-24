import { Footer } from "@/app/Footer";
import Login from "../features/auth/components/login";

function LoginPage() {
  return (
    <main className="flex min-h-screen flex-1 flex-col items-center justify-center p-6">
      <Login />
      <div className="pt-6">
        <Footer />
      </div>
    </main>
  );
}

export default LoginPage;
