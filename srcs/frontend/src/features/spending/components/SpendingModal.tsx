import type { Spending } from "@/features/spending/types";

interface SpendingModalProps {
  spending?: Spending;
  onClose: () => void;
}

export function SpendingModal({ spending, onClose }: SpendingModalProps) {
  return (
    <div>
      <h1>Spending Details</h1>
      {spending && (
        <div>
          <p>{spending.label}</p>
          <button onClick={onClose}>Close</button>
        </div>
      )}
    </div>
  );
}
