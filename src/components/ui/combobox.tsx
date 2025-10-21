"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/shared/utils";

export interface ComboboxOption {
	value: string;
	label: string;
	icon?: React.ReactNode;
}

interface ComboboxProps {
	options: ComboboxOption[];
	value: string;
	onValueChange: (value: string) => void;
	placeholder?: string;
	searchPlaceholder?: string;
	emptyText?: string;
	allowCustomValue?: boolean;
	customValuePattern?: RegExp;
	customValueError?: string;
	disabled?: boolean;
}

export function Combobox({
	options,
	value,
	onValueChange,
	placeholder = "Select option...",
	searchPlaceholder = "Search...",
	emptyText = "No option found.",
	allowCustomValue = false,
	customValuePattern,
	customValueError,
	disabled = false,
}: ComboboxProps) {
	const [open, setOpen] = React.useState(false);
	const [search, setSearch] = React.useState("");

	const selectedOption = options.find((option) => option.value === value);
	const displayValue = selectedOption?.label || value || placeholder;

	const handleSelect = (selectedValue: string) => {
		if (allowCustomValue && customValuePattern && search) {
			if (customValuePattern.test(search)) {
				onValueChange(search);
				setOpen(false);
				setSearch("");
			}
		} else {
			onValueChange(selectedValue === value ? "" : selectedValue);
			setOpen(false);
			setSearch("");
		}
	};

	const filteredOptions = options.filter((option) =>
		option.label.toLowerCase().includes(search.toLowerCase()),
	);

	const showCustomValueOption =
		allowCustomValue &&
		search &&
		!options.some(
			(opt) => opt.value.toLowerCase() === search.toLowerCase(),
		) &&
		(!customValuePattern || customValuePattern.test(search));

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					className="w-full justify-between"
					disabled={disabled}
				>
					<span className="flex items-center gap-2 truncate">
						{selectedOption?.icon}
						{displayValue}
					</span>
					<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
				<Command>
					<CommandInput
						placeholder={searchPlaceholder}
						value={search}
						onValueChange={setSearch}
					/>
					<CommandList>
						<CommandEmpty>
							{showCustomValueOption ? (
								<div className="py-6 text-center text-sm">
									Press Enter to use &quot;{search}&quot;
								</div>
							) : (
								<div className="py-6 text-center text-sm">
									{customValueError && search && customValuePattern
										? customValueError
										: emptyText}
								</div>
							)}
						</CommandEmpty>
						<CommandGroup>
							{filteredOptions.map((option) => (
								<CommandItem
									key={option.value}
									value={option.value}
									onSelect={handleSelect}
								>
									<Check
										className={cn(
											"mr-2 h-4 w-4",
											value === option.value ? "opacity-100" : "opacity-0",
										)}
									/>
									<span className="flex items-center gap-2">
										{option.icon}
										{option.label}
									</span>
								</CommandItem>
							))}
							{showCustomValueOption && (
								<CommandItem
									value={search}
									onSelect={() => handleSelect(search)}
								>
									<Check className="mr-2 h-4 w-4 opacity-0" />
									Use custom: &quot;{search}&quot;
								</CommandItem>
							)}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
