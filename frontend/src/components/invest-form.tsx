import * as React from "react";
import { CheckIcon, ChevronsUpDownIcon, PlusIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    fetchPostInvestment,
    fetchPostInvestmentTransaction,
    fetchGetInvestmentByWalletId,
    fetchPostWallets,
} from "@/api/apiService";
import { cn } from "@/lib/utils";
import { Investment, Wallet } from "@/types";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "./ui/select";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { CommandSeparator } from "cmdk";

interface InvestFormFields {
    instrument: string;
    value: string;
    paymentDate: string;
    description?: string;
}

interface InvestFormProps {
    wallets: Wallet[];
    selectedWalletId: number;
    setSelectedWalletId: (id: number) => void;
    onSuccess?: () => void;
}

const InvestForm: React.FC<InvestFormProps> = ({
    wallets,
    selectedWalletId,
    setSelectedWalletId,
    onSuccess,
}) => {
    const {
        register,
        handleSubmit,
        setValue,
        reset,
        formState: { errors },
    } = useForm<InvestFormFields>({
        defaultValues: {
            paymentDate: new Date().toISOString().split("T")[0],
            instrument: "",
            value: "",
        },
    });

    // Combobox state
    const [open, setOpen] = useState(false);

    // Nie używaj już instruments z useState ani fetchSuggestInstruments
    const [showAddWallet, setShowAddWallet] = useState(false);
    const [walletsList, setWalletsList] = useState(wallets);
    const [showAddInvestment, setShowAddInvestment] = useState(false);
    const [input, setInput] = useState("");
    const [selectedInvestment, setSelectedInvestment] = useState<string>("");

    const { data: investments } = useQuery<Investment[]>({
        queryKey: ["investments", selectedWalletId],
        queryFn: () => fetchGetInvestmentByWalletId(selectedWalletId),
        enabled: selectedWalletId !== 0,
    });

    // Filtrowanie inwestycji z portfela po input
    const filteredInvestments =
        input.length > 0
            ? investments?.filter((inv) =>
                  inv.name.toLowerCase().includes(input.toLowerCase())
              ) ?? []
            : investments ?? [];

    const handleInvestmentAdded = (newInstrument: Investment) => {
        // Możesz dodać do lokalnego state lub triggerować refetch
        setInput(newInstrument.name);
        setSelectedInvestment(newInstrument.name);
        setValue("instrument", newInstrument.name, { shouldValidate: true });
    };

    const handleWalletAdded = (newWallet: Wallet) => {
        setWalletsList([...walletsList, newWallet]);
        setSelectedWalletId(newWallet.id);
    };

    const onSubmit = async (data: InvestFormFields) => {
        try {
            // 1. Czy taki instrument już istnieje w investments?
            const existing = investments?.find(
                (inv) => inv.name === data.instrument
            );

            let investmentId: number;

            if (existing) {
                investmentId = existing.id;
            } else {
                // Dodaj nową inwestycję, jeśli nie istnieje
                const newInvestment = await fetchPostInvestment({
                    name: data.instrument,
                    symbol: data.instrument,
                    type: "fund", // lub inny typ
                    wallet: selectedWalletId,
                });
                investmentId = newInvestment.id;
            }

            // 2. Dodaj pierwszą transakcję do wybranej/nowej inwestycji
            await fetchPostInvestmentTransaction({
                investment: investmentId,
                value: parseFloat(data.value),
                type: "deposit",
                date: data.paymentDate,
                description: data.description || "",
            });

            reset();
            setSelectedInvestment("");
            setInput("");
            onSuccess && onSuccess();
        } catch (err: any) {
            alert(err.message || "Wystąpił błąd podczas zapisywania.");
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            {/* Wallet select */}
            <div>
                <Label htmlFor="wallet">Portfel</Label>
                <div className="flex gap-2 items-center">
                    <Select
                        onValueChange={(value) =>
                            setSelectedWalletId(Number(value))
                        }
                        value={String(selectedWalletId)}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Wybierz portfel" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                {wallets.map((wallet) => (
                                    <SelectItem
                                        key={wallet.id}
                                        value={String(wallet.id)}>
                                        {wallet.name}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    <Button
                        type="button"
                        onClick={() => setShowAddWallet(true)}>
                        + Dodaj portfel
                    </Button>
                </div>
                <AddWalletModal
                    open={showAddWallet}
                    onOpenChange={setShowAddWallet}
                    onAdd={handleWalletAdded}
                />
            </div>
            {/* Instrument Combobox */}
            <div>
                <Label htmlFor="instrument">Instrument inwestycyjny</Label>
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            className="w-full justify-between"
                            type="button">
                            {selectedInvestment ||
                                "Wybierz lub wpisz instrument..."}
                            <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[450px] p-0">
                        <Command>
                            <CommandInput
                                placeholder="Szukaj lub wpisz instrument"
                                value={input}
                                onValueChange={(val) => {
                                    setInput(val);
                                    setValue("instrument", val, {
                                        shouldValidate: true,
                                    });
                                }}
                                autoFocus
                            />
                            <CommandList>
                                <CommandEmpty>
                                    <div className="flex items-center justify-between px-2 py-2">
                                        <span>Nie znaleziono.</span>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="ml-2 px-2"
                                            onClick={() =>
                                                setShowAddInvestment(true)
                                            }>
                                            <PlusIcon className="h-4 w-4 mr-1" />
                                            Dodaj nowy
                                        </Button>
                                    </div>
                                    <AddInvestmentModal
                                        open={showAddInvestment}
                                        onOpenChange={setShowAddInvestment}
                                        onAdd={handleInvestmentAdded}
                                        defaultWalletId={selectedWalletId}
                                    />
                                </CommandEmpty>
                                <CommandGroup>
                                    {filteredInvestments.map((investment) => (
                                        <CommandItem
                                            key={investment.id}
                                            value={investment.name}
                                            onSelect={(currentValue) => {
                                                setSelectedInvestment(
                                                    currentValue
                                                );
                                                setValue(
                                                    "instrument",
                                                    currentValue,
                                                    { shouldValidate: true }
                                                );
                                                setOpen(false);
                                                setInput(currentValue);
                                            }}>
                                            <CheckIcon
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    selectedInvestment ===
                                                        investment.name
                                                        ? "opacity-100"
                                                        : "opacity-0"
                                                )}
                                            />
                                            {investment.name}
                                        </CommandItem>
                                    ))}
                                    <CommandSeparator />
                                    <div className="flex items-center justify-between px-2 py-2">
                                        <span>
                                            Chcesz dodać nową inwestycję?
                                        </span>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="ml-2 px-2"
                                            onClick={() =>
                                                setShowAddInvestment(true)
                                            }>
                                            <PlusIcon className="h-4 w-4 mr-1" />
                                            Dodaj nowy
                                        </Button>
                                    </div>
                                    <AddInvestmentModal
                                        open={showAddInvestment}
                                        onOpenChange={setShowAddInvestment}
                                        onAdd={handleInvestmentAdded}
                                        defaultWalletId={selectedWalletId}
                                    />
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
                {errors.instrument && (
                    <span className="text-red-500 text-xs">
                        Wymagana nazwa instrumentu
                    </span>
                )}
            </div>
            {/* Value */}
            <div>
                <Label htmlFor="value">Kwota</Label>
                <Input
                    type="number"
                    step="0.01"
                    id="value"
                    {...register("value", { required: true })}
                />
                {errors.value && (
                    <span className="text-red-500 text-xs">Podaj kwotę</span>
                )}
            </div>
            {/* Date */}
            <div>
                <Label htmlFor="paymentDate">Data zakupu</Label>
                <Input
                    type="date"
                    id="paymentDate"
                    {...register("paymentDate", { required: true })}
                />
            </div>
            {/* Opis */}
            <div>
                <Label htmlFor="description">Opis</Label>
                <Input id="description" {...register("description")} />
            </div>
            <Button type="submit" variant="default">
                Dodaj inwestycję
            </Button>
        </form>
    );
};

export default InvestForm;

interface AddWalletModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onAdd: (wallet: Wallet) => void;
}
function AddWalletModal({ open, onOpenChange, onAdd }: AddWalletModalProps) {
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);

    const handleAdd = async () => {
        setLoading(true);
        try {
            const newWallet = await fetchPostWallets({ name }); // Zakładam, że masz taką funkcję
            onAdd(newWallet);
            setName("");
            onOpenChange(false);
        } catch {
            alert("Błąd podczas dodawania portfela");
        }
        setLoading(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogTitle>Dodaj nowy portfel</DialogTitle>
                <DialogDescription>Nazwa portfela</DialogDescription>
                <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="my-2"
                />
                <DialogFooter>
                    <Button onClick={handleAdd} disabled={loading || !name}>
                        Dodaj
                    </Button>
                    <DialogClose asChild>
                        <Button variant="outline">Anuluj</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

interface AddInvestmentModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onAdd: (investment: Investment) => void;
    defaultWalletId: number;
}
export function AddInvestmentModal({
    open,
    onOpenChange,
    onAdd,
    defaultWalletId,
}: AddInvestmentModalProps) {
    const [name, setName] = useState("");
    const [symbol, setSymbol] = useState("");
    const [type, setType] = useState<
        "fund" | "stock" | "etf" | "bond" | "deposit"
    >("fund");
    const [interestRate, setInterestRate] = useState<string>("");
    const [capitalization, setCapitalization] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");
    const [loading, setLoading] = useState(false);

    const handleAdd = async () => {
        setLoading(true);
        try {
            const newInvestment = await fetchPostInvestment({
                name,
                symbol,
                type,
                wallet: defaultWalletId,
                interest_rate: interestRate ? parseFloat(interestRate) : null,
                capitalization: capitalization || null,
                end_date: endDate || null,
            });
            onAdd(newInvestment);
            setName("");
            setSymbol("");
            setType("fund");
            setInterestRate("");
            setCapitalization("");
            setEndDate("");
            onOpenChange(false);
        } catch {
            alert("Błąd podczas dodawania inwestycji");
        }
        setLoading(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogTitle>Dodaj nową inwestycję</DialogTitle>
                <DialogDescription>
                    Podaj szczegóły inwestycji.
                </DialogDescription>
                <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nazwa inwestycji"
                    className="my-2"
                />
                <Input
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                    placeholder="Symbol (opcjonalnie)"
                    className="my-2"
                />
                <Select value={type} onValueChange={(v) => setType(v as any)}>
                    <SelectTrigger className="w-full my-2">
                        <SelectValue placeholder="Wybierz typ inwestycji" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>Typ inwestycji</SelectLabel>
                            <SelectItem value="fund">Fundusz</SelectItem>
                            <SelectItem value="stock">Akcja</SelectItem>
                            <SelectItem value="etf">ETF</SelectItem>
                            <SelectItem value="bond">Obligacja</SelectItem>
                            <SelectItem value="deposit">Lokata</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
                {type === "deposit" && (
                    <>
                        <Input
                            value={interestRate}
                            onChange={(e) => setInterestRate(e.target.value)}
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            placeholder="Oprocentowanie (%)"
                            className="my-2"
                        />
                        <Input
                            value={capitalization}
                            onChange={(e) => setCapitalization(e.target.value)}
                            placeholder="Kapitalizacja (np. miesięczna, roczna)"
                            className="my-2"
                        />
                        <Input
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            type="date"
                            placeholder="Data zakończenia (opcjpnalnie)"
                            className="my-2"
                        />
                    </>
                )}
                <DialogFooter>
                    <Button onClick={handleAdd} disabled={loading || !name}>
                        Dodaj
                    </Button>
                    <DialogClose asChild>
                        <Button variant="outline">Anuluj</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

