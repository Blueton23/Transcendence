import Modal from "../../../shared/ui/Modal";

interface CreateIdeaModalProps {
	onClose: () => void;
}

export function CreateIdeaModal ({onClose}: CreateIdeaModalProps) {
	return (
		<Modal icon="pinplus" title="Epingler une idée" subtitle="Road trip Suisse" onClose={onClose}>
			A venir
		</Modal>
	);
}