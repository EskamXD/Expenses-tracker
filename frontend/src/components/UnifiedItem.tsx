import React from "react";
import { Row, Col } from "react-bootstrap";
import Form from "react-bootstrap/Form";
import CloseButton from "react-bootstrap/CloseButton";
import UnifiedDropdown from "./UnifiedDropdown";
import "../assets/styles/main.css";
import { Item } from "../types";
import {
    selectExpensesOptions,
    selectIncomeOptions,
} from "../config/selectOption";

interface UnifiedItemProps {
    formId: string;
    index: number;
    items: Item[];
    setItems: React.Dispatch<React.SetStateAction<Item[]>>;
    updateItem: Function;
    removeItem: Function;
    showQuantity: boolean;
}

/**
 * @brief Renders a single item in a form, including input fields and controls.
 *
 * The UnifiedItem component renders an individual item within a list of items in a form.
 * It provides fields for selecting a category, entering a value and description, and optionally
 * a quantity. The component can update the item's details and handle item removal if required.
 *
 * @param {string} formId - A unique identifier for the form.
 * @param {number} index - The index of the item in the list of items.
 * @param {Object} item - The current item data being rendered.
 * @param {Function} setItems - A function to update the list of items.
 * @param {boolean} showQuantity - Flag to show or hide the quantity input field.
 *
 * @return {JSX.Element} A form row component for managing a single transaction item.
 */
const UnifiedItem: React.FC<UnifiedItemProps> = ({
    formId,
    index,
    items,
    setItems,
    updateItem,
    removeItem,
    showQuantity,
}) => {
    if (index === 0) {
        return <></>;
    }

    const selectOptions =
        formId === "expense-form" ? selectExpensesOptions : selectIncomeOptions;

    const item = items.find((item) => item.id === index);
    // console.log(items, index, item);

    if (!item) {
        return <></>;
    }

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
                                e.target.value,
                                setItems
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
                            updateItem(
                                Number(item.id),
                                "value",
                                e.target.value,
                                setItems
                            )
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
                                e.target.value,
                                setItems
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
                                    e.target.value,
                                    setItems
                                )
                            }
                        />
                    </Col>
                )}
                <Col style={{ maxWidth: "fit-content" }}>
                    <UnifiedDropdown
                        type="owner"
                        label="Wybierz właścicieli"
                        personInDropdown={item.owners}
                        setPersonInDropdown={(newOwners: number[]) =>
                            updateItem(
                                Number(item.id),
                                "owners",
                                newOwners,
                                setItems
                            )
                        }
                    />
                </Col>

                <Col style={{ maxWidth: "fit-content" }}>
                    {index !== 1 ? (
                        <CloseButton
                            onClick={() => removeItem(items, setItems, item.id)}
                        />
                    ) : (
                        <CloseButton style={{ visibility: "hidden" }} />
                    )}
                </Col>
            </Row>
        </div>
    );
};

export default UnifiedItem;
