import React, { useEffect, useState } from "react";
import CloseButton from "react-bootstrap/CloseButton";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Spinner from "react-bootstrap/Spinner";
import UnifiedDropdown from "./UnifiedDropdown";
import "../assets/styles/main.css";
import { Item } from "../types";
import { fetchItemPredictions } from "../api/apiService";
import {
    selectExpensesOptions,
    selectIncomeOptions,
} from "../config/selectOption";
import { useFetcher } from "react-router-dom";

interface UnifiedItemProps {
    formId: string;
    index: number;
    shop: string;
    items: Item[];
    setItems: React.Dispatch<React.SetStateAction<Item[]>>;
    updateItem: Function;
    removeItem: Function;
    showQuantity: boolean;
    reset: boolean;
    setReset: Function;
}

const UnifiedItem: React.FC<UnifiedItemProps> = ({
    formId,
    index,
    shop,
    items,
    setItems,
    updateItem,
    removeItem,
    showQuantity,
    reset,
    setReset,
}) => {
    const [query, setQuery] = useState("");
    const [predictions, setPredictions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const [isClicked, setIsClicked] = useState(false);

    if (index === 0) {
        return <></>;
    }

    const selectOptions =
        formId === "expense-form" ? selectExpensesOptions : selectIncomeOptions;

    const item = items.find((item) => item.id === index);

    useEffect(() => {
        if (isClicked) return;
        if (query.length >= 3) {
            setIsLoading(true);
            setIsDropdownVisible(true);

            const fetchPredictions = async () => {
                try {
                    const results = await fetchItemPredictions(shop, query);
                    setPredictions(results);
                } catch (error) {
                    console.error("Error fetching item predictions:", error);
                } finally {
                    setIsLoading(false);
                }
            };

            fetchPredictions();
        } else {
            setPredictions([]);
            setIsDropdownVisible(false);
        }
    }, [query]);

    useEffect(() => {
        if (reset) {
            setQuery("");
            setPredictions([]);
            setIsDropdownVisible(false);
            setIsClicked(false);
            setReset(!reset);
        }
    }, [reset]);

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
                <Col style={{ position: "relative" }}>
                    <Form.Control
                        type="text"
                        placeholder="Opis/Nazwa"
                        value={query || item.description || ""}
                        onChange={(e) => {
                            setIsClicked(false);
                            const newQuery = e.target.value;
                            setQuery(newQuery);

                            updateItem(
                                Number(item.id),
                                "description",
                                newQuery,
                                setItems
                            );

                            if (newQuery === "") {
                                // Wyczyszczenie opisu w przypadku pustego inputa
                                updateItem(
                                    Number(item.id),
                                    "description",
                                    "",
                                    setItems
                                );
                            }
                        }}
                    />
                    {isLoading && <Spinner />}
                    {isDropdownVisible && predictions.length > 0 && (
                        <ul
                            style={{
                                position: "absolute",
                                top: "100%",
                                left: 0,
                                right: 0,
                                background: "#333",
                                border: "1px solid #ddd",
                                borderRadius: "4px",
                                maxHeight: "150px",
                                overflowY: "auto",
                                zIndex: 1000,
                                listStyle: "none",
                                margin: 0,
                                padding: "0.5rem",
                            }}>
                            {predictions.map((prediction: any) => (
                                <li
                                    key={prediction.id}
                                    style={{
                                        padding: "0.5rem",
                                        cursor: "pointer",
                                        color: "#fff",
                                        textAlign: "left",
                                    }}
                                    onClick={() => {
                                        updateItem(
                                            Number(item.id),
                                            "description",
                                            prediction.name,
                                            setItems
                                        );
                                        setQuery(prediction.name);
                                        setPredictions([]);
                                        setIsDropdownVisible(false);
                                        setIsClicked(true);
                                    }}>
                                    {prediction.name} ({prediction.frequency})
                                </li>
                            ))}
                        </ul>
                    )}
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

