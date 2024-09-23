import React from "react";
import { Row, Col } from "react-bootstrap";
import Form from "react-bootstrap/Form";
import CloseButton from "react-bootstrap/CloseButton";
import OwnerDropdown from "./OwnerDropdown";
import "../assets/styles/main.css";
import { Item } from "../types";

interface UnifiedItemProps {
    item: Item;
    items: Item[];
    setItems: Function;
    removeItem: Function;
    selectOptions: { value: string; label: string }[];
    showQuantity: boolean;
}

/**
 * @brief Renders a single item in a form, including input fields and controls.
 *
 * The UnifiedItem component renders an individual item within a list of items in a form.
 * It provides fields for selecting a category, entering a value and description, and optionally
 * a quantity. The component can update the item's details and handle item removal if required.
 *
 * @param {Object} item - The current item data being rendered.
 * @param {Object[]} items - The list of all items, used to update state.
 * @param {Function} setItems - A function to update the list of items.
 * @param {Function} removeItem - A function to remove the item from the list.
 * @param {Object[]} selectOptions - Options for category selection.
 * @param {boolean} showQuantity - Flag to show or hide the quantity input field.
 *
 * @return {JSX.Element} A form row component for managing a single transaction item.
 */
const UnifiedItem: React.FC<UnifiedItemProps> = ({
    item,
    items,
    setItems,
    removeItem,
    selectOptions,
    showQuantity,
}) => {
    /**
     * @brief Updates a specific field of the item.
     *
     * This function updates the specified field of the item with the given value
     * and updates the state to reflect this change.
     *
     * @param {number} itemId - The ID of the item to update.
     * @param {string} key - The key of the item field to update.
     * @param {string|number} value - The new value to set for the specified field.
     */
    const updateItem = (
        itemId: number,
        key: string,
        value: number | string
    ) => {
        console.log("UnifiedItem update item", itemId, key, value);
        setItems((prevItems: Item[]) =>
            prevItems.map((el) =>
                el.id === itemId ? { ...el, [key]: value } : el
            )
        );
    };

    return (
        <div>
            <Row>
                <Col xs={2}>
                    <Form.Select
                        id={`category-${item.id}`}
                        className="mb-3"
                        value={item.category || ""}
                        onChange={(e) =>
                            updateItem(
                                Number(item.id),
                                "category",
                                e.target.value
                            )
                        }>
                        {selectOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </Form.Select>
                </Col>
                <Col className="width-100">
                    <Form.Control
                        type="text"
                        placeholder="Kwota"
                        value={item.value}
                        onChange={(e) =>
                            updateItem(Number(item.id), "value", e.target.value)
                        }
                    />
                </Col>
                <Col>
                    <Form.Control
                        type="text"
                        placeholder="Opis/Nazwa"
                        value={item.description || ""}
                        onChange={(e) => {
                            updateItem(
                                Number(item.id),
                                "description",
                                e.target.value
                            );
                        }}
                    />
                </Col>
                {showQuantity && (
                    <Col className="width-100">
                        <Form.Control
                            type="number"
                            placeholder="Ilość"
                            value={item.quantity || ""}
                            onChange={(e: any) =>
                                updateItem(
                                    Number(item.id),
                                    "quantity",
                                    e.target.value
                                )
                            }
                        />
                    </Col>
                )}
                <Col style={{ maxWidth: "fit-content" }}>
                    <OwnerDropdown
                        item={item}
                        items={items}
                        setItems={setItems}
                    />
                </Col>

                <Col style={{ maxWidth: "fit-content" }}>
                    {removeItem && items.length > 1 && item.id !== 1 ? (
                        <CloseButton
                            onClick={() => removeItem(items, setItems, item.id)}
                        />
                    ) : (
                        // Render an invisible CloseButton to maintain layout consistency
                        <CloseButton style={{ visibility: "hidden" }} />
                    )}
                </Col>
            </Row>
        </div>
    );
};

export default UnifiedItem;

