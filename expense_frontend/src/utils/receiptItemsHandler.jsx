/**
 * @file receiptItemsHandler.jsx
 * @brief Utility functions for managing receipt items in forms.
 *
 * This file defines utility functions used to handle operations on receipt items,
 * such as adding a new item to a list and removing an existing item. These functions
 * help manage state updates for receipt items in various form components.
 */

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
export const addItem = (items, setItems) => {
    // console.log(items);
    const lastItemCategory = items[items.length - 1].category;
    setItems([
        ...items,
        {
            id:
                items.length +
                1 /**< Assign a new ID based on the length of the items array. */,
            category:
                lastItemCategory /**< Use the category of the last item for consistency. */,
            value: "",
            description: "",
            quantity: "",
            owner: 1 /**< Default owner set to "kamil". */,
            date: new Date()
                .toISOString()
                .split("T")[0] /**< Set current date as the date. */,
        },
    ]);
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
export const removeItem = (items, setItems, id) => {
    // console.log(items);
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

