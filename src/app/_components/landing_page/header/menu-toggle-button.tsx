import { Menu, X } from "lucide-react";

type MenuToggleButtonProps = {
	isOpen: boolean;
	onToggle: () => void;
};

export function MenuToggleButton({ isOpen, onToggle }: MenuToggleButtonProps) {
	return (
		<button
			type="button"
			onClick={onToggle}
			aria-label={isOpen ? "Close Menu" : "Open Menu"}
			aria-expanded={isOpen}
			className="-m-2.5 -mr-4 relative p-2.5"
		>
			{isOpen ? (
				<X className="size-6 transition-transform duration-200" />
			) : (
				<Menu className="size-6 transition-transform duration-200" />
			)}
		</button>
	);
}
