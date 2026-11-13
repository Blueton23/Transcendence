import { BackLink } from "@/app/BackLink";
import { Footer } from "@/app/Footer";
import Login from "../features/auth/components/login";

function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col p-6">
      <BackLink to="/" />
      <div className="flex flex-1 flex-col items-center justify-center">
        <Login />
        <div className="pt-6">
          <Footer />
        </div>
      </div>
    </main>
  );
}

export default LoginPage;
