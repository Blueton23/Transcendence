export function StepPositionBadge({ position }: { position: number }) {
  return (
    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-dark text-sm font-bold text-inverse md:h-8 md:w-8">
      {position}
    </span>
  );
}
