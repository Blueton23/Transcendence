import { BackLink } from "@/app/BackLink";
import { Footer } from "@/app/Footer";
import ProfileCreate from "../features/profile/components/Signup";

function SignupPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-6 md:py-10">
      <BackLink to="/" />
      <ProfileCreate />
      <div className="pt-4">
        <Footer />
      </div>
    </main>
  );
}

export default SignupPage;
