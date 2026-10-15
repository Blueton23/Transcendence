import type { Travel } from "@/features/travel/types";
import Button from "@/shared/ui/Button";
import Card from "@/shared/ui/Card";
import Input from "@/shared/ui/Input";
import Text from "@/shared/ui/Text";
import { useState } from "react";

interface CreatedScreenProps {
  travel: Travel;
  onClose: () => void;
}

//TODO: branchement une fois que friendship est terminé
export function CreatedScreen({ travel, onClose }: CreatedScreenProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error("le lien n'a pas ete copié");
    }
  };

  const link = `${window.location.origin}/join/${travel.inviteToken}`;
  return (
    <div className="flex flex-col gap-3">
      <Text font="mono" tone="muted">
        {" "}
        Invite tes voyageurs pour planifier ensemble {travel.title}
      </Text>
      <div className="flex flex-col items-start gap-1">
        <Text>Rechercher un ami</Text>
        <Input placeholder="Pseudo ou prenom..."></Input>
      </div>
      <div className="flex flex-col items-start gap-1">
        <Text>Lien d'invitation</Text>
        <Card className="flex w-full items-center justify-between bg-surface-control p-2! pl-4!">
          <Text font="mono">{link}</Text>
          <Button
            size="sm"
            variant="dark"
            onClick={handleCopy}
            className="md:px-4! md:py-1.5!"
          >
            {copied ? "Copié ✓" : "Copier"}
          </Button>
        </Card>
      </div>

      <Button variant="ghost" className="w-full underline" onClick={onClose}>
        Passer pour l'instant
      </Button>
    </div>
  );
}
