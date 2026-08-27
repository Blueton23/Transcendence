interface CountBadgeProps {
  count?: number;
  variant?: "desktop" | "mobile";
}

const base =
  "flex  items-center justify-center rounded-full bg-brand-primary font-bold text-inverse";

const variantStyles = {
  desktop: "flex h-5 w-5 text-sm",
  mobile: "absolute top-1 right-1.25 h-3.75 w-3.75 text-[10px]",
};

function CountBadge({ count, variant = "desktop" }: CountBadgeProps) {
  if (count == null || count <= 0) return null;
  return <span className={`${base} ${variantStyles[variant]}`}>{count}</span>;
}
export default CountBadge;
