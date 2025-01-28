import { Item } from "../types";

export const addItem = (
    items: Item[],
    setItems: React.Dispatch<React.SetStateAction<Item[]>>
) => {
    if (typeof setItems !== "function") {
        console.error("setItems is not a valid function");
        return;
    }

    const lastItemCategory = items[items.length - 1].category;
    setItems([
        ...items,
        {
            id: items.length + 1,
            category: lastItemCategory,
            value: "",
            description: "",
            quantity: 1,
            owners: [1, 2],
        },
    ]);
};

export const updateItem = (
    itemId: number,
    key: string,
    value: string | number,
    setItems: React.Dispatch<React.SetStateAction<Item[]>>
) => {
    if (typeof setItems !== "function") {
        console.error("setItems is not a valid function");
        return;
    }

    setItems((prevItems: Item[]) => {
        return prevItems.map((el) => {
            if (el.id === itemId) {
                if (key === "owners") {
                    const currentOwners = Array.isArray(el[key])
                        ? (el[key] as number[])
                        : [];

                    const newOwner = Number(value);

                    const updatedOwners = currentOwners.includes(newOwner)
                        ? currentOwners.filter((id) => id !== newOwner) // Usuń
                        : [...currentOwners, newOwner]; // Dodaj

                    return { ...el, [key]: updatedOwners };
                }

                return { ...el, [key]: value };
            }
            return el;
        });
    });
};

export const removeItem = (
    items: Item[],
    setItems: React.Dispatch<React.SetStateAction<Item[]>>,
    id: number
) => {
    if (typeof setItems !== "function") {
        console.error("setItems is not a valid function");
        return;
    }

    const updatedItems = items.filter((item) => item.id !== id);
    const reIndexedItems = updatedItems.map((item, index) => ({
        ...item,
        id: index + 1,
    }));

    setItems(reIndexedItems);
};

