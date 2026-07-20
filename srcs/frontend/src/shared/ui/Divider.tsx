type DividerOrientation = "horizontal" | "vertical";

interface DividerProps {
	orientation?: DividerOrientation;
	className?: string;
}

const orientationStyles = {
	horizontal: "w-full h-px",
	vertical: "h-4 w-px",
};

const baseStyle = "shrink-0 bg-border-divider"

function Divider({ orientation = "horizontal", className = "" }: DividerProps) {
	const orientationStyle = orientationStyles[orientation];

	return (
		<div
			role="separator"
			aria-orientation={orientation}
			className={`${baseStyle} ${orientationStyle} ${className}`}
		/>
	);
}
export default Divider;
