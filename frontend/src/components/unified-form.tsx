import React, { useEffect, useImperativeHandle, useMemo } from "react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";
import PayerDropdown from "@/components/payer-dropdown";
import OwnersDropdown from "@/components/owners-dropdown";
import { Item, Receipt } from "@/types";
import { categoryOptions } from "@/lib/select-option";
import AutoSuggestInput from "@/components/auto-suggest-input";
import { fetchSearchRecentShops, fetchItemPredictions } from "@/api/apiService";

interface FormValues {
    paymentDate: string;
    payer: number;
    shop: string;
    transactionType: "expense" | "income";
    items: Item[];
}

interface UnifiedFormProps {
    formId: string;
    transactionType: "expense" | "income";
    buttonLabel: string;
    showQuantity: boolean;
    receipt?: Receipt; // Jeśli edytujemy istniejący paragon
    onSubmitReceipt?: (updatedReceipt: Receipt) => void;
    onDirtyChange?: (isDirty: boolean) => void;
    footerActions?: React.ReactNode;
}
export interface UnifiedFormRef {
    submitForm: () => void;
}

const UnifiedForm = React.forwardRef<UnifiedFormRef, UnifiedFormProps>(
    (
        {
            formId,
            transactionType,
            buttonLabel,
            showQuantity = true,
            receipt,
            onSubmitReceipt,
            onDirtyChange,
            footerActions,
        },
        ref
    ) => {
        const defaultValues: FormValues = {
            paymentDate: receipt
                ? receipt.payment_date
                : new Date().toISOString().split("T")[0],
            payer: receipt ? receipt.payer : 1,
            shop: receipt ? receipt.shop : "",
            transactionType: transactionType,
            items:
                receipt && receipt.items && receipt.items.length > 0
                    ? receipt.items
                    : [
                          {
                              id: 0,
                              category: "food_drinks",
                              value: "",
                              description: "",
                              owners: [1, 2],
                              quantity: 1,
                          },
                      ],
        };

        const { register, control, handleSubmit, formState, reset } =
            useForm<FormValues>({
                defaultValues,
            });

        useEffect(() => {
            if (onDirtyChange) {
                onDirtyChange(formState.isDirty);
            }
        }, [formState.isDirty, onDirtyChange]);

        useImperativeHandle(ref, () => ({
            submitForm: handleSubmit(onSubmit),
        }));

        const { fields, append, remove } = useFieldArray({
            control,
            name: "items",
        });

        const items = useWatch({
            control,
            name: "items",
        });
        const shopValue = useWatch({ control, name: "shop" });

        const totalSum = useMemo(() => {
            return items.reduce((acc, item) => {
                const value = parseFloat(item.value as string) || 0;
                return acc + value;
            }, 0);
        }, [items]);

        const handleKeyDown = (event: React.KeyboardEvent<HTMLFormElement>) => {
            if (event.key === "Enter") {
                event.preventDefault();
            }
        };

        const onSubmit = (data: FormValues) => {
            console.log(data.items[0].owners);
            const finalReceipt: Receipt = {
                id: receipt ? receipt.id : 0,
                payment_date: data.paymentDate,
                payer: data.payer,
                shop: data.shop,
                transaction_type: data.transactionType,
                items: data.items,
            };
            if (onSubmitReceipt) {
                onSubmitReceipt(finalReceipt);
            } else {
                console.log("Gotowy paragon:", finalReceipt);
            }

            reset({
                paymentDate: new Date().toISOString().split("T")[0],
                payer: 1,
                shop: "",
                transactionType: transactionType,
                items: [
                    {
                        id: 0,
                        category: "food_drinks",
                        value: "",
                        description: "",
                        owners: [1, 2],
                        quantity: 1,
                    },
                ],
            });
        };

        return (
            <>
                <form
                    id={formId}
                    onKeyDown={handleKeyDown}
                    onSubmit={handleSubmit(onSubmit)}
                    className="flex flex-col">
                    <div className="flex flex-col gap-4">
                        {/* Data płatności */}
                        <div className="flex flex-col gap-1">
                            <Label htmlFor="paymentDate">Data płatności</Label>
                            <Input
                                type="date"
                                id="paymentDate"
                                {...register("paymentDate", { required: true })}
                            />
                        </div>

                        {/* Sklep */}
                        <div className="flex flex-col gap-1">
                            <Label htmlFor="shop">Sklep</Label>
                            <Controller
                                control={control}
                                name="shop"
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <AutoSuggestInput
                                        value={field.value}
                                        onChange={field.onChange}
                                        placeholder="Wpisz nazwę sklepu"
                                        fetcher={fetchSearchRecentShops}
                                        transformResult={(item) => item.name}
                                    />
                                )}
                            />
                        </div>

                        {/* Płatnik */}
                        <div className="flex justify-between gap-8 items-end">
                            <div className="flex flex-col gpa-1">
                                <Label htmlFor="payer">Płatnik</Label>
                                <Controller
                                    control={control}
                                    name="payer"
                                    rules={{ required: true }}
                                    render={({ field }) => (
                                        <PayerDropdown
                                            payer={field.value}
                                            setPayer={field.onChange}
                                        />
                                    )}
                                />
                            </div>
                            <Button
                                type="button"
                                variant="secondary"
                                className="flex-grow"
                                onClick={() =>
                                    append({
                                        id: 0,
                                        category: "food_drinks",
                                        value: "",
                                        description: "",
                                        owners: [1, 2],
                                        quantity: 1,
                                    })
                                }>
                                Dodaj pozycję
                            </Button>
                        </div>
                    </div>

                    {/* <ScrollArea> */}
                    <div className="flex-1 overflow-y-auto mt-4">
                        {/* Lista pozycji */}
                        <div className="flex flex-col gap-4 border-1 rounded-md p-3">
                            {fields.map((field, index) => (
                                <div
                                    key={field.id}
                                    className="grid grid-cols-10 items-end gap-8">
                                    <div className="flex flex-col gap-1 col-span-2">
                                        <Label
                                            htmlFor={`items.${index}.category`}>
                                            Kategoria
                                        </Label>
                                        <Controller
                                            control={control}
                                            name={
                                                `items.${index}.category` as const
                                            }
                                            rules={{ required: true }}
                                            render={({ field }) => (
                                                <Select
                                                    onValueChange={
                                                        field.onChange
                                                    }
                                                    value={field.value || ""}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Wybierz kategorię" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {categoryOptions[
                                                            transactionType
                                                        ].map((opt) => (
                                                            <SelectItem
                                                                key={opt.value}
                                                                value={
                                                                    opt.value
                                                                }>
                                                                {opt.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <Label htmlFor={`items.${index}.value`}>
                                            Kwota
                                        </Label>
                                        <Input
                                            id={`items.${index}.value`}
                                            placeholder="Kwota"
                                            {...register(
                                                `items.${index}.value` as const,
                                                { required: true }
                                            )}
                                        />
                                    </div>

                                    <div className="flex flex-col gap-1 col-span-3">
                                        <Label
                                            htmlFor={`items.${index}.description`}>
                                            Opis/Nazwa
                                        </Label>
                                        <Controller
                                            control={control}
                                            name={`items.${index}.description`}
                                            rules={{ required: true }}
                                            render={({ field }) => (
                                                <AutoSuggestInput
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    placeholder="Opis/Nazwa"
                                                    // Przekazujemy funkcję fetchera – dodatkowo wykorzystujemy wartość sklepu
                                                    fetcher={(query: string) =>
                                                        fetchItemPredictions(
                                                            shopValue,
                                                            query
                                                        )
                                                    }
                                                    transformResult={(item) =>
                                                        item.name
                                                    }
                                                />
                                            )}
                                        />
                                    </div>

                                    {showQuantity && (
                                        <div className="flex flex-col gap-1">
                                            <Label
                                                htmlFor={`items.${index}.quantity`}>
                                                Ilość
                                            </Label>
                                            <Input
                                                type="number"
                                                id={`items.${index}.quantity`}
                                                placeholder="Ilość"
                                                {...register(
                                                    `items.${index}.quantity` as const,
                                                    { required: true }
                                                )}
                                            />
                                        </div>
                                    )}

                                    <div className="flex flex-col gap-1 col-span-2">
                                        <Label
                                            htmlFor={`items.${index}.owners`}>
                                            Właściciele
                                        </Label>
                                        <Controller
                                            control={control}
                                            name={
                                                `items.${index}.owners` as const
                                            }
                                            rules={{ required: true }}
                                            render={({
                                                field: controllerField,
                                            }) => (
                                                <OwnersDropdown
                                                    owners={
                                                        controllerField.value ||
                                                        []
                                                    }
                                                    setOwners={(
                                                        newOwners: number[]
                                                    ) => {
                                                        // Wywołaj setter z nową tablicą ownerów
                                                        controllerField.onChange(
                                                            newOwners
                                                        );
                                                    }}
                                                />
                                            )}
                                        />
                                    </div>

                                    {/* Dodatkowe pole dla właścicieli można dodać analogicznie – np. przy użyciu UnifiedDropdown */}
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        className="aspect-square"
                                        onClick={() => remove(index)}>
                                        <X />
                                    </Button>
                                </div>
                            ))}
                        </div>
                        {/* </ScrollArea> */}
                    </div>
                </form>
                <div className="flex flex-col gap-4 sticky bg-background bottom-0 border-t p-4">
                    <div>
                        <span>Suma: </span>
                        <strong>{totalSum.toFixed(2)}</strong>
                    </div>
                    <div className="grid grid-cols-3 gap-4 w-full">
                        <Button
                            onClick={() => handleSubmit(onSubmit)()}
                            variant="default">
                            {buttonLabel}
                        </Button>
                        {footerActions}
                    </div>
                </div>
            </>
        );
    }
);

export default UnifiedForm;
