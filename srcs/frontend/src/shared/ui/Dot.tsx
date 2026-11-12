interface DotProps {
  className?: string;
}

function Dot({ className = "" }: DotProps) {
  return (
    <span
      aria-hidden="true"
      className={`size-2.5 shrink-0 rounded-full ${className}`}
    />
  );
}
export default Dot;
