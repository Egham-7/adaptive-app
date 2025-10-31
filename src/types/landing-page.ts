import type React from "react";

export type MenuItem = {
	name: string;
	href: string;
};

export type IconMenuItem = {
	name: string;
	href: string;
	icon: React.ComponentType<{
		size?: number;
		"aria-hidden"?: boolean;
	}>;
};
