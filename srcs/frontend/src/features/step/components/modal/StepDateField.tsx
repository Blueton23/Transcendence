import Icon from "@/shared/ui/Icon";

interface StepDateFieldProps {
  label: string;
  onClick: () => void;
}

export function StepDateField({ label, onClick }: StepDateFieldProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseDown={(e) => e.stopPropagation()}
      className="flex w-full cursor-pointer items-center gap-2 rounded-md bg-surface-control px-3 py-2 text-sm"
    >
      <Icon name="cal" className="text-brand-primary" />
      <span className="flex-1 text-left">{label}</span>
      <Icon name="chev-down" size={16} className="text-muted" />
    </button>
  );
}
