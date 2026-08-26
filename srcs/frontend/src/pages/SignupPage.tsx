import ProfileCreate from "../features/profile/components/ProfileCreate";



function SignupPage() {
    return (
      <div className="mx-auto flex max-w3xl flex-col gap-6 p-8">
        <ProfileCreate onClose={[]} />
      </div>
    );
  }

  export default SignupPage;