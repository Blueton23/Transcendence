import Button from "../../../shared/ui/Button";
import Heading from "../../../shared/ui/Heading";
import Icon from "../../../shared/ui/Icon";

interface ProfileModifyProps {
  onClose: () => void;
}

function ProfileModify({ onClose }: ProfileModifyProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-2xl rounded-lg bg-surface p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <Heading level={2} size="md">
            Modifier le profil
          </Heading>

          <button
            type="button"
            onClick={onClose}
            className="text-muted hover:text-text"
            aria-label="Fermer"
          >
            <Icon name="x" size={20} />
          </button>
        </div>

        <div className="mt-6 flex flex-col gap-4">
          <p>Fenêtre de modification du profil</p>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Annuler
            </Button>

            <Button variant="primary">
              Enregistrer
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileModify;