/**
 * @file receiptItemsHandler.jsx
 * @brief Utility functions for managing receipt items in forms.
 *
 * This file defines utility functions used to handle operations on receipt items,
 * such as adding a new item to a list and removing an existing item. These functions
 * help manage state updates for receipt items in various form components.
 */

import { Item } from "../types";

/**
 * @brief Adds a new item to the list of receipt items.
 *
 * The `addItem` function appends a new item to the end of the current list of items.
 * The new item inherits the category from the last item in the list to maintain consistency.
 * It also initializes other fields to default values and sets the owner to "kamil" by default.
 *
 * @param {Object[]} items - The current list of items.
 * @param {React.Dispatch<React.SetStateAction<Item[]>>} setItems - Function to update the list of items.
 */
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
            owners: [],
        },
    ]);
};

/**
 * @brief Updates a specific field of an item in the list of receipt items.
 *
 * The `updateItem` function updates a specific field of an item with the specified ID
 * in the list of items. It sets the new value for the specified field and updates the
 * list of items accordingly.
 *
 * @param {number} itemId - The ID of the item to update.
 * @param {string} key - The key of the item field to update.
 * @param {string|number} value - The new value to set for the specified field.
 * @param {React.Dispatch<React.SetStateAction<Item[]>>} setItems - Function to update the list of items.
 */
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

/**
 * @brief Removes an item from the list of receipt items.
 *
 * The `removeItem` function removes an item with the specified ID from the list.
 * After removing the item, it re-indexes the remaining items to ensure IDs remain
 * unique and sequential.
 *
 * @param {Object[]} items - The current list of items.
 * @param {React.Dispatch<React.SetStateAction<Item[]>>} setItems - Function to update the list of items.
 * @param {number} id - The ID of the item to be removed.
 */
export const removeItem = (
    items: Item[],
    setItems: React.Dispatch<React.SetStateAction<Item[]>>,
    id: number
) => {
    if (typeof setItems !== "function") {
        console.error("setItems is not a valid function");
        return;
    }

    // Filter out the item to be removed
    const updatedItems = items.filter((item) => item.id !== id);

    // Re-index the remaining items to ensure unique, sequential IDs
    const reIndexedItems = updatedItems.map((item, index) => ({
        ...item,
        id:
            index +
            1 /**< Assign a new sequential ID to each remaining item. */,
    }));

    setItems(reIndexedItems);
};
