import React from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
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
import { categoryOptions } from "@/config/selectOption";

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
}

// Definicja ref, który pozwala wywołać submitForm programatycznie
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
        },
        ref
    ) => {
        // Ustawiamy defaultValues – jeśli mamy receipt, używamy jego danych, w przeciwnym razie ustawiamy wartości domyślne
        const defaultValues: FormValues = {
            paymentDate: receipt
                ? receipt.payment_date
                : new Date().toISOString().split("T")[0],
            payer: receipt ? receipt.payer : -1,
            shop: receipt ? receipt.shop : "",
            transactionType: transactionType,
            items:
                receipt && receipt.items && receipt.items.length > 0
                    ? receipt.items
                    : [
                          {
                              id: 0,
                              category: "",
                              value: "",
                              description: "",
                              owners: [1, 2],
                              quantity: 1,
                          },
                      ],
        };

        const { register, control, handleSubmit, setValue, watch, formState } =
            useForm<FormValues>({
                defaultValues,
            });

        // Informujemy rodzica o zmianach w formularzu
        React.useEffect(() => {
            if (onDirtyChange) {
                onDirtyChange(formState.isDirty);
            }
        }, [formState.isDirty, onDirtyChange]);

        // Umożliwiamy rodzicowi wywołanie submitu formularza
        React.useImperativeHandle(ref, () => ({
            submitForm: handleSubmit(onSubmit),
        }));

        // useFieldArray do dynamicznego zarządzania pozycjami
        const { fields, append, remove } = useFieldArray({
            control,
            name: "items",
        });

        // Funkcja submit – budujemy finalny obiekt Receipt
        const onSubmit = (data: FormValues) => {
            console.log(data.items[0].owners);
            const finalReceipt: Receipt = {
                id: receipt ? receipt.id : 0, // dla nowego paragonu można ustawić id = 0
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
        };

        return (
            <form
                id={formId}
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col gap-4">
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
                    <Input
                        id="shop"
                        placeholder="Wpisz nazwę sklepu"
                        {...register("shop", { required: true })}
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
                                category: "",
                                value: "",
                                description: "",
                                owners: [],
                                quantity: 1,
                            })
                        }>
                        Dodaj pozycję
                    </Button>

                    <Button type="submit" variant="default">
                        {buttonLabel}
                    </Button>
                </div>

                {/* Lista pozycji */}
                <div className="flex flex-col gap-4 border-1 rounded-md p-3">
                    {fields.map((field, index) => (
                        <div
                            key={field.id}
                            className="grid grid-cols-10 items-end gap-8">
                            <div className="flex flex-col gap-1 col-span-2">
                                <Label htmlFor={`items.${index}.category`}>
                                    Kategoria
                                </Label>
                                <Controller
                                    control={control}
                                    name={`items.${index}.category` as const}
                                    rules={{ required: true }}
                                    render={({ field }) => (
                                        <Select
                                            onValueChange={field.onChange}
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
                                                        value={opt.value}>
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
                                <Label htmlFor={`items.${index}.description`}>
                                    Opis/Nazwa
                                </Label>
                                <Input
                                    id={`items.${index}.description`}
                                    placeholder="Opis/Nazwa"
                                    {...register(
                                        `items.${index}.description` as const,
                                        { required: true }
                                    )}
                                />
                            </div>

                            {showQuantity && (
                                <div className="flex flex-col gap-1">
                                    <Label htmlFor={`items.${index}.quantity`}>
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
                                <Label htmlFor={`items.${index}.owners`}>
                                    Właściciele
                                </Label>
                                <Controller
                                    control={control}
                                    name={`items.${index}.owners` as const}
                                    rules={{ required: true }}
                                    render={({ field: controllerField }) => (
                                        <OwnersDropdown
                                            owners={controllerField.value || []}
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
            </form>
        );
    }
);

export default UnifiedForm;

