import { useRef, useState } from "react";
import type { ChangeEvent } from "react";

import Avatar from "@/shared/ui/Avatar";
import Button from "@/shared/ui/Button";
import { useSubmitAction } from "@/shared/hooks/useSubmitAction";

import { modifyProfilePicture } from "../api/profile";
import { useAuth } from "../../auth/context/useAuth";

function ProfilePicture() {
  const { currentUser, setCurrentUser } = useAuth();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { submit, isSubmitting, error } = useSubmitAction(() => {
    if (!selectedFile) {
      throw new Error("Aucune image sélectionnée.");
    }

    return modifyProfilePicture(selectedFile);
  });

  function handleSelectPicture() {
    fileInputRef.current?.click();
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setSelectedFile(file);
  }

  async function handleSubmit() {
    const result = await submit();

    if (result.success && result.data) {
      setCurrentUser(result.data.traveler);
      setSelectedFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  if (!currentUser) {
    return null;
  }

  const initials =
    `${currentUser.firstName?.charAt(0) ?? ""}${currentUser.lastName?.charAt(0) ?? ""}`
      .toUpperCase();

  return (
    <div className="flex flex-col items-center gap-3">
      {currentUser.profilePictureUrl ? (
        <img
          src={currentUser.profilePictureUrl}
          alt="Photo de profil"
          className="h-24 w-24 rounded-full object-cover"
        />
      ) : (
        <Avatar size="lg" color="1">
          {initials}
        </Avatar>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
      />

      <Button
        type="button"
        variant="secondary"
        onClick={handleSelectPicture}
        disabled={isSubmitting}
      >
        Choisir une photo
      </Button>

      {selectedFile && (
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm text-text-secondary">
            {selectedFile.name}
          </p>

          <Button
            type="button"
            variant="primary"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Enregistrement..." : "Enregistrer la photo"}
          </Button>
        </div>
      )}

      {error && (
        <p className="text-sm font-medium text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}

export default ProfilePicture;