import React, { useEffect, useState, useRef } from "react";
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
import UnifiedDropdown from "./UnifiedDropdown";
import UnifiedItem, { UnifiedItemRef } from "./UnifiedItem";
import moment from "moment";
import { Item, Receipt } from "../types";
import { fetchSearchRecentShops } from "../api/apiService";

interface UnifiedFormProps {
    formId: string;
    buttonLabel: string;
    showQuantity: boolean;
    receipt?: Receipt;
}

const UnifiedForm: React.FC<UnifiedFormProps> = ({
    formId,
    buttonLabel,
    showQuantity = false,
    receipt,
}) => {
    const form = useForm({
        defaultValues: {
            paymentDate: new Date().toISOString().split("T")[0],
            payer: -1,
            shop: "",
        },
    });

    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const [isRecentShopClicked, setIsRecentShopClicked] = useState(false);

    const [items, setItems] = useState<number[]>([1]);
    const itemRefs = useRef<Record<number, React.RefObject<UnifiedItemRef>>>(
        {}
    );

    const addItem = () => {
        const newId = items.length + 1;
        setItems((prev) => [...prev, newId]);
        itemRefs.current[newId] = React.createRef();
    };

    const removeItem = (id: number) => {
        setItems((prev) => prev.filter((itemId) => itemId !== id));
        delete itemRefs.current[id];
    };

    const handleSubmit = (data: any) => {
        const collectedItems: Item[] = [];
        for (const id of items) {
            const itemRef = itemRefs.current[id];
            if (itemRef && itemRef.current) {
                const itemData = itemRef.current.getItemData();
                if (!itemData) {
                    alert("Uzupełnij wszystkie pola przed zapisaniem!");
                    return;
                }
                collectedItems.push(itemData);
            }
        }

        console.log("Gotowy paragon:", {
            ...data,
            items: collectedItems,
        });
    };

    useEffect(() => {
        if (isRecentShopClicked) return;
        if (query.length >= 3) {
            setIsDropdownVisible(true);
            setIsLoading(true);
            const fetchResults = async () => {
                try {
                    const shops = await fetchSearchRecentShops(query);
                    setResults(shops);
                } catch (error) {
                    console.error("Error fetching recent shops:", error);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchResults();
        } else {
            setResults([]);
            setIsDropdownVisible(false);
        }
    }, [query]);

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="flex flex-col h-[80vh] gap-4 p-4">
                {/* Data płatności */}
                <FormField
                    control={form.control}
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

                {/* Sklep */}
                <FormField
                    control={form.control}
                    name="shop"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Sklep</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Wpisz nazwę sklepu"
                                    {...field}
                                    onChange={(e) => {
                                        setIsRecentShopClicked(false);
                                        field.onChange(e.target.value);
                                        setQuery(e.target.value);
                                    }}
                                />
                            </FormControl>
                            {isLoading && (
                                <Skeleton className="h-5 w-full mt-2" />
                            )}
                            {isDropdownVisible && results.length > 0 && (
                                <ul className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-md shadow-md max-h-40 overflow-y-auto z-10 p-2">
                                    {results.map((shop: any) => (
                                        <li
                                            key={shop.id}
                                            className="p-2 hover:bg-gray-200 cursor-pointer"
                                            onClick={() => {
                                                field.onChange(shop.name);
                                                setQuery(shop.name);
                                                setResults([]);
                                                setIsDropdownVisible(false);
                                                setIsRecentShopClicked(true);
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
                <div className="flex flex-wrap gap-4">
                    <UnifiedDropdown
                        label="Płatnik"
                        personInDropdown={form.watch("payer")}
                        setPersonInDropdown={(
                            val: number | ((prev: number) => number)
                        ) =>
                            form.setValue(
                                "payer",
                                typeof val === "function"
                                    ? val(form.getValues("payer"))
                                    : val
                            )
                        }
                    />

                    <Button onClick={addItem} variant="outline">
                        Dodaj pozycję
                    </Button>
                    <Button type="submit">{buttonLabel}</Button>
                </div>

                {/* Pozycje rachunku */}
                <div className="flex-1 overflow-y-auto p-4">
                    {items.map((id) => (
                        <UnifiedItem
                            key={id}
                            index={id}
                            removeItem={removeItem}
                            ref={
                                itemRefs.current[id] ||
                                (itemRefs.current[id] = React.createRef())
                            }
                        />
                    ))}
                </div>
            </form>
        </Form>
    );
};

export default UnifiedForm;

