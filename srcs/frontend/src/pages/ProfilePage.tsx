import { useState } from "react";

import ProfileInfo from "../features/profile/components/ProfileInfo";
import Modify from "../features/profile/components/Modify";

import Button from "../shared/ui/Button";
import Modal from "../shared/ui/Modal";

function ProfilePage() {
  const [isModifyOpen, setIsModifyOpen] = useState(false)

  return (
    <div className="max-w3xl mx-auto flex flex-col gap-6 p-8">
      <ProfileInfo />
      <Button type="button" variant="primary" onClick={() => setIsModifyOpen(true)} > Modifier le profil </Button>

      {isModifyOpen && ( <Modal icon="pinplus" title="Modifier le profil" subtitle="Modifiez les informations de votre profil." onClose={() => setIsModifyOpen(false)} > <Modify onSuccess={() => setIsModifyOpen(false)} /> </Modal> )}
      
    </div>
  );
}

export default ProfilePage;
