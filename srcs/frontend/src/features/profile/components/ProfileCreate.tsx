import { useState } from "react";
import Button from "../../../shared/ui/Button";
import Heading from "../../../shared/ui/Heading";
import Icon from "../../../shared/ui/Icon";
import IconButton from "../../../shared/ui/IconButton";
import Avatar from "../../../shared/ui/Avatar";
import Input from "../../../shared/ui/Input";
import { useProfile } from "../hooks/useProfile";


interface SignupPageProps {
  onClose: () => void;
}

function SignupPage({ onClose }: SignupPageProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { createProfile, isLoading, error } = useProfile();
  
  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    console.log("_SDU firstName : ",firstName);
    const traveler = await createProfile({
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      username: username.trim(),
      email: email.trim(),
    });

    if (traveler) {
      console.log("Traveler créé :", traveler);

      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-[575px] rounded-[28px] bg-surface-container p-8 shadow-xl">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface">
              <Icon name="edit" size={22} />
            </div>

            <Heading level={2} size="md">
              Créer un profil
            </Heading>
          </div>

          <IconButton
            icon={<Icon name="x" size={18} />}
            label="Fermer"
            variant="ghost"
            size="sm"
            onClick={onClose}
          />
        </div>

        {/* Avatar */}
        <div className="mt-6 flex items-center gap-4">
          <Avatar size="lg" color="4">
            CP
          </Avatar>

          <Button
            variant="outline"
            icon={<Icon name="image" size={16} />}
          >
            Changer l'avatar
          </Button>
        </div>

        {/* Formulaire */}
        <form
          className="mt-7 flex flex-col gap-4"
          onSubmit={handleSubmit}
        >
          {/* Prénom / Nom */}
          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-text-secondary">
                Prénom
              </span>
              <Input
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-text-secondary">
                Nom
              </span>

              <Input
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
              />
            </label>
          </div>

          {/* Pseudo */}
          <label className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-text-secondary">
              Pseudo
            </span>

            <Input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              variant="mono"
            />
          </label>

          {/* Email */}
          <label className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-text-secondary">
              Email
            </span>

            <Input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>

          {/* Password */}
          <label className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-text-secondary">
              Mot de passe
            </span>

            <Input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              variant="mono"
            />
          </label>

          {/* Erreur */}
          {error && (
            <p className="text-sm font-medium text-red-500">
              {error}
            </p>
          )}

          {/* Enregistrer */}
          <div className="mt-3">
            <Button
              type="submit"
              variant="primary"
              className="w-full rounded-full py-3"
              disabled={isLoading}
            >
              {isLoading ? "Création..." : "Enregistrer"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SignupPage;