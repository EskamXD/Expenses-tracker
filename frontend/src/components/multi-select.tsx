import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
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
import { Badge } from "@/components/ui/badge";

export type MultiSelectOption = {
    value: string;
    label: string;
};

type MultiSelectProps = {
    options: MultiSelectOption[];
    value: string[];
    onChange: (next: string[]) => void;

    placeholder?: string;
    searchPlaceholder?: string;
    emptyText?: string;

    className?: string;
    disabled?: boolean;

    // jeśli chcesz ograniczyć “chipki” w przycisku
    maxBadges?: number;
};

export function MultiSelect({
    options,
    value,
    onChange,
    placeholder = "Wybierz…",
    searchPlaceholder = "Szukaj…",
    emptyText = "Brak wyników.",
    className,
    disabled,
    maxBadges = 2,
}: MultiSelectProps) {
    const [open, setOpen] = React.useState(false);

    const selected = React.useMemo(() => {
        const map = new Map(options.map((o) => [o.value, o.label]));
        return value.map((v) => ({ value: v, label: map.get(v) ?? v }));
    }, [options, value]);

    const toggle = (val: string) => {
        if (value.includes(val)) onChange(value.filter((x) => x !== val));
        else onChange([...value, val]);
    };

    const buttonLabel =
        selected.length === 0 ? (
            placeholder
        ) : selected.length <= maxBadges ? (
            <span className="flex flex-wrap gap-1">
                {selected.map((s) => (
                    <Badge
                        key={s.value}
                        variant="secondary"
                        className="font-normal">
                        {s.label}
                    </Badge>
                ))}
            </span>
        ) : (
            <span className="flex items-center gap-2">
                <Badge variant="secondary" className="font-normal">
                    Wybrano: {selected.length}
                </Badge>
            </span>
        );

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("w-full justify-between", className)}
                    disabled={disabled}>
                    <span className="truncate text-left">{buttonLabel}</span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>

            <PopoverContent
                className="w-[--radix-popover-trigger-width] p-0"
                align="start">
                <Command>
                    <CommandInput placeholder={searchPlaceholder} />
                    <CommandList>
                        <CommandEmpty>{emptyText}</CommandEmpty>
                        <CommandGroup>
                            {options.map((opt) => {
                                const isSelected = value.includes(opt.value);
                                return (
                                    <CommandItem
                                        key={opt.value}
                                        value={opt.label}
                                        onSelect={() => toggle(opt.value)}
                                        className="cursor-pointer">
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                isSelected
                                                    ? "opacity-100"
                                                    : "opacity-0"
                                            )}
                                        />
                                        {opt.label}
                                    </CommandItem>
                                );
                            })}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
