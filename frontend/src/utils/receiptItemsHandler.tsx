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
 * @param {Function} setItems - Function to update the list of items.
 */
export const addItem = (items: Item[], setItems: Function) => {
    const lastItemCategory = items[items.length - 1].category;
    setItems([
        ...items,
        {
            id: items.length + 1,
            category: lastItemCategory,
            value: "",
            description: "",
            quantity: "1",
            owner: [-1],
            date: new Date().toISOString().split("T")[0],
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
 * @param {Function} setItems - Function to update the list of items.
 */
export const updateItem = (
    itemId: number,
    key: string,
    value: number | string,
    setItems: Function
) => {
    setItems((prevItems: Item[]) =>
        prevItems.map((el) => (el.id === itemId ? { ...el, [key]: value } : el))
    );
};

/**
 * @brief Removes an item from the list of receipt items.
 *
 * The `removeItem` function removes an item with the specified ID from the list.
 * After removing the item, it re-indexes the remaining items to ensure IDs remain
 * unique and sequential.
 *
 * @param {Object[]} items - The current list of items.
 * @param {Function} setItems - Function to update the list of items.
 * @param {number} id - The ID of the item to be removed.
 */
export const removeItem = (items: Item[], setItems: Function, id: number) => {
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
