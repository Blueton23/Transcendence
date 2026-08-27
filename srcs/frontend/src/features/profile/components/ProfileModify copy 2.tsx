import { useEffect, useState } from "react";

import Button from "../../../shared/ui/Button";
import Heading from "../../../shared/ui/Heading";
import Icon from "../../../shared/ui/Icon";
import IconButton from "../../../shared/ui/IconButton";
import Avatar from "../../../shared/ui/Avatar";
import Input from "../../../shared/ui/Input";
import Divider from "../../../shared/ui/Divider";

import { useAuth } from "../../auth/context/AuthContext";
import { useProfile } from "../hooks/useProfile";

interface ProfileModifyProps {
  onClose: () => void;
}

function ProfileModify({ onClose }: ProfileModifyProps) {
  const { currentUser, setCurrentUser } = useAuth();
  const { updateProfile, isLoading, error } = useProfile();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (currentUser) {
      setFirstName(currentUser.first_name);
      setLastName(currentUser.last_name);
      setUsername(currentUser.username);
      setEmail(currentUser.email);
    }
  }, [currentUser]);

  const initials = `${firstName?.charAt(0) ?? ""}${lastName?.charAt(0) ?? ""}`.toUpperCase();

  const handleSubmit = () => {
    console.log("Données à enregistrer :", {
      first_name: firstName,
      last_name: lastName,
      username,
      email,
    });

    // TODO : envoyer les données à ton backend

    onClose();
  };

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
              Modifier le profil
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
            {initials}
          </Avatar>

          <Button
            variant="outline"
            icon={<Icon name="image" size={16} />}
          >
            Changer l'avatar
          </Button>
        </div>

        {/* Formulaire */}
        <div className="mt-7 flex flex-col gap-4">

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
        </div>

        {/* Mot de passe */}
        <div className="mt-6">
          <Divider />

          <div className="flex items-center justify-between pt-5">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-text-secondary">
                Mot de passe
              </span>

              <span className="font-mono text-sm tracking-[0.25em] text-text">
                ••••••••
              </span>
            </div>

            <button
              type="button"
              className="text-sm font-semibold text-brand-primary transition-colors hover:text-brand-primary/80"
            >
              Changer
            </button>
          </div>
        </div>

        {/* Enregistrer */}
        <div className="mt-7">
          <Button
            variant="primary"
            className="w-full rounded-full py-3"
            onClick={handleSubmit}
          >
            Enregistrer
          </Button>
        </div>

      </div>
    </div>
  );
}

export default ProfileModify;