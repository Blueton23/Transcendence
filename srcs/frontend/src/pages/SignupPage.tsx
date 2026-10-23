import { Footer } from "@/app/Footer";
import ProfileCreate from "../features/profile/components/Signup";

function SignupPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10">
      <ProfileCreate />
      <div className="pt-10">
        <Footer />
      </div>
    </main>
  );
}

export default SignupPage;
