import React, {
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
} from "react";
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
import { FileUp, X } from "lucide-react";
import PayerDropdown from "@/components/payer-dropdown";
import OwnersDropdown from "@/components/owners-dropdown";
import { Item, Receipt } from "@/types";
import { categoryOptions } from "@/lib/select-option";
import AutoSuggestInput from "@/components/auto-suggest-input";
import {
    fetchSearchRecentShops,
    fetchItemPredictions,
    uploadReceiptPdf,
} from "@/api/apiService";
import { calculate } from "@/lib/calculate";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

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
    receipt?: Receipt;
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
        ref,
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

        const { register, control, handleSubmit, formState, reset, setValue } =
            useForm<FormValues>({ defaultValues });

        const fileInputRef = useRef<HTMLInputElement | null>(null);
        const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);
        // const [uploadReceiptError, setUploadReceiptError] = useState<
        //     string | null
        // >(null);
        // const [uploadReceiptWarning, setUploadReceiptWarning] = useState<
        //     string | null
        // >(null);
        const [uploadReceiptFallback, setUploadReceiptFallback] = useState<
            string | null
        >(null);

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

        const handleReceiptFileChange = async (
            event: React.ChangeEvent<HTMLInputElement>,
        ) => {
            const file = event.target.files?.[0];
            if (!file) return;

            setIsUploadingReceipt(true);
            // setUploadReceiptError(null);
            // setUploadReceiptWarning(null);
            setUploadReceiptFallback(null);

            try {
                // const parsed = await uploadReceiptPdf(file);
                const { data: parsed, error } = useQuery<Receipt>({
                    queryKey: ["uploadReceipt", file.name],
                    queryFn: async () => {
                        return await uploadReceiptPdf(file);
                    },
                    enabled: !!file,
                });

                if (error) {
                    throw new Error(
                        error instanceof Error
                            ? error.message
                            : "Nie udało się przetworzyć PDF.",
                    );
                }

                if (!parsed) {
                    throw new Error(
                        "Nie otrzymano danych z przetwarzania PDF.",
                    );
                }

                if (parsed.payment_date) {
                    setValue("paymentDate", parsed.payment_date, {
                        shouldDirty: true,
                        shouldValidate: true,
                    });
                }

                if (parsed.shop) {
                    setValue("shop", parsed.shop, {
                        shouldDirty: true,
                        shouldValidate: true,
                    });
                }

                if (parsed.items?.length) {
                    const normalizedItems = parsed.items.map((item, index) => ({
                        id: item.id ?? index,
                        category: item.category ?? "food_drinks",
                        value: item.value ?? "",
                        description: item.description ?? "",
                        owners:
                            item.owners && item.owners.length > 0
                                ? item.owners
                                : [1, 2],
                        quantity: item.quantity ?? 1,
                    }));

                    setValue("items", normalizedItems, {
                        shouldDirty: true,
                        shouldValidate: true,
                    });
                }
            } catch (error) {
                toast.error(
                    error instanceof Error
                        ? error.message
                        : "Nie udało się przetworzyć PDF.",
                );
                console.error("Błąd przetwarzania PDF:", error);
            } finally {
                setIsUploadingReceipt(false);
                event.target.value = "";
            }
        };

        const handleKeyDown = (event: React.KeyboardEvent<HTMLFormElement>) => {
            if (event.key === "Enter") {
                event.preventDefault();
            }
        };

        const onSubmit = (data: FormValues) => {
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

                            <div className="flex flex-col md:flex-row gap-2 flex-grow">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="application/pdf,.pdf"
                                    className="hidden"
                                    onChange={handleReceiptFileChange}
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="flex-grow md:flex-grow-0"
                                    onClick={() =>
                                        fileInputRef.current?.click()
                                    }
                                    disabled={isUploadingReceipt}>
                                    <FileUp className="mr-2 h-4 w-4" />
                                    {isUploadingReceipt
                                        ? "Przetwarzanie PDF..."
                                        : "Wczytaj paragon PDF"}
                                </Button>
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

                        {/* {(uploadReceiptError || uploadReceiptWarning) && (
                            <div className="flex flex-col gap-2">
                                {uploadReceiptError && (
                                    <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
                                        {uploadReceiptError}
                                    </div>
                                )}
                                {uploadReceiptWarning && (
                                    <div className="rounded-md border border-yellow-300 bg-yellow-50 px-3 py-2 text-sm text-yellow-800">
                                        {uploadReceiptWarning}
                                    </div>
                                )}
                            </div>
                        )} */}
                    </div>

                    {/* <ScrollArea> */}
                    <div className="flex-1 overflow-y-auto mt-4">
                        {/* Lista pozycji */}
                        <div className="flex flex-col gap-4 border-1 rounded-md p-3">
                            {fields.map((field, index) => (
                                <div
                                    key={field.id}
                                    className="grid grid-cols-3 lg:grid-cols-10 items-end gap-8">
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
                                                { required: true },
                                            )}
                                            onBlur={(e) => {
                                                const raw =
                                                    e.currentTarget.value;
                                                const transformed =
                                                    calculate(raw);
                                                // zaktualizuj wartość w formie
                                                setValue(
                                                    `items.${index}.value`,
                                                    transformed,
                                                    {
                                                        shouldValidate: true,
                                                        shouldDirty: true,
                                                    },
                                                );
                                            }}
                                        />
                                    </div>

                                    <div className="flex flex-col gap-1 col-span-2 lg:col-span-3">
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
                                                            query,
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
                                                    { required: true },
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
                                                        newOwners: number[],
                                                    ) => {
                                                        // Wywołaj setter z nową tablicą ownerów
                                                        controllerField.onChange(
                                                            newOwners,
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
                                        className="lg:aspect-square"
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
                    <div className="grid lg:grid-cols-3 gap-4 w-full">
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
    },
);

export default UnifiedForm;

