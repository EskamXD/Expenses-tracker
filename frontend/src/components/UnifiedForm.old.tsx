import React, {
    useEffect,
    useState,
    useRef,
    forwardRef,
    useImperativeHandle,
} from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Form,
    FormField,
    FormItem,
    FormControl,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import UnifiedDropdown from "./unified-dropdown";
import UnifiedItem, { UnifiedItemRef } from "@/components/UnifiedItem.old";
import moment from "moment";
import { Item, Receipt } from "@/types";
import { fetchSearchRecentShops } from "@/api/apiService";

export interface UnifiedFormRef {
    submitForm: () => void;
}

interface UnifiedFormProps {
    formId: string;
    transaction_type: "income" | "expense";
    buttonLabel: string;
    showQuantity: boolean;
    receipt?: Receipt;
    onDirtyChange?: (isDirty: boolean) => void;
    onSubmitReceipt?: (updatedReceipt: Receipt) => void;
}

interface FormValues {
    paymentDate: string;
    payer: number;
    shop: string;
    transactionType: string;
}
const UnifiedForm = forwardRef<UnifiedFormRef, UnifiedFormProps>(
    (
        {
            formId,
            transaction_type,
            buttonLabel,
            showQuantity = false,
            receipt,
            onDirtyChange,
            onSubmitReceipt,
        },
        ref
    ) => {
        const form = useForm<FormValues>({
            defaultValues: {
                paymentDate: new Date().toISOString().split("T")[0],
                payer: -1,
                shop: "",
            },
        });
        const { handleSubmit, control, watch, setValue, formState } = form;

        useEffect(() => {
            if (receipt) {
                console.log(receipt);
                setValue("paymentDate", receipt.payment_date);
                setValue("payer", receipt.payer);
                setValue("shop", receipt.shop);
                if (receipt.items && receipt.items.length > 0) {
                    // Przypisujemy identyfikatory pozycji, np. [1,2,3,...]
                    setItems(receipt.items.map((_, idx) => idx + 1));
                }
            }
        }, [receipt, setValue]);

        useEffect(() => {
            if (onDirtyChange) {
                onDirtyChange(formState.isDirty);
            }
        }, [formState.isDirty, onDirtyChange]);

        const [query, setQuery] = useState("");
        const [results, setResults] = useState<any[]>([]);
        const [isDropdownVisible, setIsDropdownVisible] = useState(false);

        useImperativeHandle(ref, () => ({
            submitForm: handleSubmit(onSubmit),
        }));

        // Zmieniony typ: ref-y mogą mieć current: UnifiedItemRef | null
        const itemRefs = useRef<
            Record<number, React.RefObject<UnifiedItemRef | null>>
        >({});

        const [items, setItems] = useState<number[]>([1]);

        const addItem = () => {
            const newId = items.length + 1;
            setItems((prev) => [...prev, newId]);
            if (!itemRefs.current[newId]) {
                itemRefs.current[newId] = React.createRef<UnifiedItemRef>();
            }
        };

        const removeItem = (id: number) => {
            setItems((prev) => prev.filter((itemId) => itemId !== id));
            delete itemRefs.current[id];
        };

        const onSubmit = (data: FormValues) => {
            const collectedItems: Item[] = [];
            for (const id of items) {
                const itemRef = itemRefs.current[id];
                if (itemRef?.current) {
                    const itemData = itemRef.current.getItemData();
                    if (!itemData) {
                        toast.info("Uzupełnij wszystkie potrzebne informacje");
                        return;
                    }
                    collectedItems.push(itemData);
                }
            }
            const finalReceipt = {
                id: 0,
                payment_date: data.paymentDate,
                payer: data.payer,
                shop: data.shop,
                transaction_type: data.transactionType,
                items: collectedItems,
            } as Receipt;
            if (onSubmitReceipt) {
                onSubmitReceipt(finalReceipt as Receipt);
            } else {
                console.log("Gotowy paragon:", finalReceipt);
            }
        };

        return (
            <Form {...form}>
                <form
                    id={formId}
                    onSubmit={handleSubmit(onSubmit)}
                    className="flex flex-col h-[80vh] gap-4 p-4">
                    {/* Data płatności */}
                    <FormField
                        control={control}
                        name="paymentDate"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Data płatności</FormLabel>
                                <FormControl>
                                    <Input
                                        type="date"
                                        {...field}
                                        onChange={(e) =>
                                            field.onChange(
                                                moment(e.target.value).format(
                                                    "YYYY-MM-DD"
                                                )
                                            )
                                        }
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Sklep z dropdownem */}
                    <FormField
                        control={control}
                        name="shop"
                        render={({ field }) => (
                            <FormItem className="relative">
                                <FormLabel>Sklep</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Wpisz nazwę sklepu"
                                        {...field}
                                        onChange={(e) => {
                                            field.onChange(e.target.value);
                                            setQuery(e.target.value);
                                        }}
                                    />
                                </FormControl>
                                {/* {isLoading && (
                                <Skeleton className="h-5 w-full mt-2" />
                            )} */}
                                {isDropdownVisible && results.length > 0 && (
                                    <ul className="absolute top-full left-0 right-0 bg-background border border-input rounded-md shadow-md max-h-40 overflow-y-auto z-10 mt-1">
                                        {results.map((shop: any) => (
                                            <li
                                                key={shop.id}
                                                className="p-2 hover:bg-muted cursor-pointer text-sm"
                                                onClick={() => {
                                                    field.onChange(shop.name);
                                                    setQuery(shop.name);
                                                    setResults([]);
                                                    setIsDropdownVisible(false);
                                                }}>
                                                {shop.name}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Płatnik i przyciski */}
                    <div className="flex flex-wrap gap-4 items-center">
                        <UnifiedDropdown
                            label="Płatnik"
                            personInDropdown={watch("payer")}
                            setPersonInDropdown={(
                                val: number | ((prev: number) => number)
                            ) =>
                                setValue(
                                    "payer",
                                    typeof val === "function"
                                        ? val(watch("payer"))
                                        : val
                                )
                            }
                        />

                        <Button
                            type="button"
                            onClick={addItem}
                            variant="outline">
                            Dodaj pozycję
                        </Button>

                        <Button type="submit" variant="default">
                            {buttonLabel}
                        </Button>
                    </div>

                    {/* Pozycje rachunku */}
                    <div className="flex-1 overflow-y-auto space-y-4">
                        {items.map((id, idx) => (
                            <UnifiedItem
                                key={id}
                                index={id}
                                formId={formId}
                                removeItem={removeItem}
                                showQuantity={showQuantity}
                                // Przekazujemy initialData tylko, gdy receipt istnieje i ma wystarczającą liczbę itemów
                                initialData={
                                    receipt &&
                                    receipt.items &&
                                    receipt.items[idx]
                                        ? receipt.items[idx]
                                        : undefined
                                }
                                ref={
                                    itemRefs.current[id] ||
                                    (itemRefs.current[id] =
                                        React.createRef<UnifiedItemRef>())
                                }
                            />
                        ))}
                    </div>
                </form>
            </Form>
        );
    }
);

export default UnifiedForm;
