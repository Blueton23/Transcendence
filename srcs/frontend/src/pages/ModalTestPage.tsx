import { useNavigate } from "react-router";
import Modal from "../shared/ui/Modal";

function ModalTestPage() {
  const navigate = useNavigate();
  return (
    <Modal
      icon="pinplus"
      title="Placer l'étape"
      subtitle="hello i cant wait to travel with you"
      onClose={() => navigate("/design-system")}
    >
      <p>Modifier le profil</p>
    </Modal>
  );
}
export default ModalTestPage;
