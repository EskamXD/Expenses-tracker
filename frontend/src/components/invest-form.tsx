import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Invest, Wallet } from "@/types";
import AutoSuggestInput from "@/components/auto-suggest-input";
import { fetchSearchInstruments } from "@/api/apiService";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

export interface InvestFormFields {
    paymentDate: string;
    instrument: string;
    value: string;
    purchasePrice: string;
    units: string;
}

interface InvestFormProps {
    onSubmitInvest: (data: Invest) => void;
    wallets: Wallet[];
    selectedWalletId: number;
    setSelectedWalletId: (id: number) => void;
}

const InvestForm: React.FC<InvestFormProps> = ({
    onSubmitInvest,
    wallets,
    selectedWalletId,
    setSelectedWalletId,
}) => {
    const {
        register,
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<InvestFormFields>({
        defaultValues: {
            paymentDate: new Date().toISOString().split("T")[0],
            instrument: "",
            value: "",
            purchasePrice: "",
            units: "",
        },
    });

    const onSubmit = (data: InvestFormFields) => {
        const invest: Invest = {
            wallet: selectedWalletId as number,
            instrument: data.instrument,
            value: parseFloat(data.value),
            purchase_price: parseFloat(data.purchasePrice),
            units: parseFloat(data.units),
            payment_date: data.paymentDate,
            transaction_type: "buy",
        };
        onSubmitInvest(invest);
        reset();
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
            <div className="flex flex-col gap-4">
                {/* Data zakupu */}
                <div className="flex flex-col gap-1">
                    <Label htmlFor="paymentDate">Data zakupu</Label>
                    <Input
                        type="date"
                        id="paymentDate"
                        {...register("paymentDate", { required: true })}
                    />
                    {errors.paymentDate && (
                        <span className="text-red-500 text-xs">
                            Wymagana data zakupu
                        </span>
                    )}
                </div>

                {/* Portfel */}
                <div className="flex flex-col gap-1 mb-4">
                    <Label htmlFor="wallet">Portfel</Label>
                    <Select
                        value={selectedWalletId ? String(selectedWalletId) : ""}
                        onValueChange={(val) =>
                            setSelectedWalletId(Number(val))
                        }>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Wybierz portfel" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Portfele</SelectLabel>
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
                </div>

                {/* Fundusz */}
                <div className="flex flex-col gap-1">
                    <Label htmlFor="instrument">Fundusz</Label>
                    <Controller
                        control={control}
                        name="instrument"
                        rules={{ required: true }}
                        render={({ field }) => (
                            <AutoSuggestInput
                                value={field.value}
                                onChange={field.onChange}
                                placeholder="Symbol lub nazwa funduszu"
                                fetcher={fetchSearchInstruments}
                                transformResult={(item) =>
                                    `${item.symbol} — ${item.name}`
                                }
                            />
                        )}
                    />

                    {errors.instrument && (
                        <span className="text-red-500 text-xs">
                            Wymagana nazwa funduszu
                        </span>
                    )}
                </div>

                {/* Kwota inwestycji */}
                <div className="flex flex-col gap-1">
                    <Label htmlFor="value">Kwota</Label>
                    <Input
                        type="number"
                        step="0.01"
                        id="value"
                        placeholder="Kwota"
                        {...register("value", { required: true, min: 0 })}
                    />
                    {errors.value && (
                        <span className="text-red-500 text-xs">
                            Podaj kwotę &gt; 0
                        </span>
                    )}
                </div>

                {/* Cena jednostki */}
                <div className="flex flex-col gap-1">
                    <Label htmlFor="purchasePrice">Cena jednostki</Label>
                    <Input
                        type="number"
                        step="0.0001"
                        id="purchasePrice"
                        placeholder="Cena jednostki"
                        {...register("purchasePrice", {
                            required: true,
                            min: 0,
                        })}
                    />
                    {errors.purchasePrice && (
                        <span className="text-red-500 text-xs">
                            Podaj cenę jednostki &gt; 0
                        </span>
                    )}
                </div>

                {/* Ilość jednostek */}
                <div className="flex flex-col gap-1">
                    <Label htmlFor="units">Liczba jednostek</Label>
                    <Input
                        type="number"
                        step="0.000001"
                        id="units"
                        placeholder="Liczba jednostek"
                        {...register("units", { required: true, min: 0 })}
                    />
                    {errors.units && (
                        <span className="text-red-500 text-xs">
                            Podaj liczbę jednostek &gt; 0
                        </span>
                    )}
                </div>
            </div>

            <div className="flex flex-col gap-4 sticky bg-background bottom-0 border-t p-4 mt-8">
                <Button type="submit" variant="default">
                    Dodaj inwestycję
                </Button>
            </div>
        </form>
    );
};

export default InvestForm;

