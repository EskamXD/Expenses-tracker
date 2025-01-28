import React, { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Spinner from "react-bootstrap/Spinner";
import UnifiedDropdown from "./UnifiedDropdown";
import UnifiedItem from "./UnifiedItem";
import { addItem, updateItem, removeItem } from "../utils/receiptItemsHandler";
import moment from "moment";
import { Item, Receipt } from "../types";
import { fetchPostReceipt, fetchSearchRecentShops } from "../api/apiService";
import { validateAndEvaluate } from "../utils/valuesCheckExpression";

import "../assets/styles/main.css";

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
    const [paymentDate, setPaymentDate] = useState(
        new Date().toISOString().split("T")[0]
    );
    const [payer, setPayer] = useState(-1);
    const [shop, setShop] = useState("");
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const [isRecentShopClicked, setIsRecentShopClicked] = useState(false);
    const [reset, setReset] = useState(false);

    const [items, setItems] = useState<Item[]>([
        {
            id: 1,
            category: "food_drinks",
            value: "",
            description: "",
            quantity: 1,
            owners: [1, 2],
        },
    ]);

    useEffect(() => {
        console.log(receipt);
        if (receipt) {
            setPaymentDate(
                receipt.payment_date || new Date().toISOString().split("T")[0]
            );
            setPayer(receipt.payer || -1);
            setShop(receipt.shop || "");
            setItems(receipt.items || []);
        }
    }, [receipt]);

    const handleSubmit = async (e: any) => {
        e.preventDefault();

        try {
            items.forEach((item: Item) => {
                // console.log("handleSbumit", item);
                const result = validateAndEvaluate(item) as {
                    status: boolean;
                    message: string;
                };
                if (!result) {
                    throw new Error("Niepoprawne dane w formularzu.");
                }
            });
        } catch (error) {
            console.error(error);

            return;
        }

        const receiptData = [
            {
                payment_date: paymentDate,
                payer: payer,
                shop: shop,
                transaction_type: "expense",
                items: items,
            },
        ] as Receipt[];

        fetchPostReceipt(receiptData)
            .then(() => {
                setItems([
                    {
                        id: 1,
                        category: "food_drinks",
                        value: "",
                        description: "",
                        quantity: 1,
                        owners: [1, 2],
                    },
                ]);
                setShop("");
                setQuery("");
                setIsRecentShopClicked(false);
                setIsDropdownVisible(false);
                setReset(true);
            })
            .catch((error) => {
                console.error(error);
            });
    };

    const handleDateChange = (e: any) => {
        const newDate = moment(e.target.value).format("YYYY-MM-DD");
        setPaymentDate(newDate);
    };

    useEffect(() => {
        if (isRecentShopClicked) return;
        if (query.length >= 3) {
            setIsDropdownVisible(true);
            setIsLoading(true); // Rozpoczęcie ładowania
            const fetchResults = async () => {
                try {
                    const shops = await fetchSearchRecentShops(query);
                    setResults(shops);
                } catch (error) {
                    console.error("Error fetching recent shops:", error);
                } finally {
                    setIsLoading(false); // Zakończenie ładowania
                }
            };

            fetchResults();
        } else {
            setResults([]);
            setIsDropdownVisible(false);
        }
    }, [query]);

    const calculateTotal = () => {
        return items
            .reduce((sum, item) => {
                const itemValue = parseFloat(item.value.replace(",", ".")) || 0;
                return sum + itemValue;
            }, 0)
            .toFixed(2);
    };

    return (
        <form
            onSubmit={handleSubmit}
            style={{
                display: "flex",
                flexDirection: "column",
                height: "80vh", // Wypełnia całe okno przeglądarki
            }}>
            {/* Górna część formularza */}
            <div style={{ flex: "0 0 auto", padding: "1rem" }}>
                <Form.Control
                    id={`${formId}-calendar`}
                    type="date"
                    className="mb-3"
                    value={paymentDate}
                    onChange={handleDateChange}
                />
                <div style={{ position: "relative" }}>
                    <Form.Control
                        type="text"
                        placeholder="Sklep"
                        className="mb-3"
                        value={query}
                        onChange={(e) => {
                            setIsRecentShopClicked(false);
                            setShop(e.target.value);
                            setQuery(e.target.value);
                        }}
                    />
                    {isLoading && <Spinner />}
                    {isDropdownVisible && results.length > 0 && (
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
                            {results.map((shop: any) => (
                                <li
                                    key={shop.id}
                                    style={{
                                        padding: "0.5rem",
                                        cursor: "pointer",
                                        color: "#fff",
                                        textAlign: "left",
                                    }}
                                    onClick={() => {
                                        setShop(shop.name);
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
                </div>
                <Row className="d-flex gap-2 space-between margin-0">
                    <Col xs={2} align="start" className="padding-0">
                        <UnifiedDropdown
                            type="payer"
                            label="Płatnik"
                            personInDropdown={payer}
                            setPersonInDropdown={setPayer}
                        />
                    </Col>
                    <Col xs="auto" className="padding-0">
                        <Button
                            variant="primary"
                            type="button"
                            onClick={() => addItem(items, setItems)}>
                            Dodaj rzecz
                        </Button>
                    </Col>
                    <Col xs="auto" align="end" className="padding-0">
                        <Button variant="success" type="submit">
                            {buttonLabel}
                        </Button>
                    </Col>
                </Row>
            </div>

            {/* Główna część z przewijanymi elementami */}
            <div
                style={{
                    flex: "1 1 auto",
                    overflowY: "auto",
                    padding: "1rem",
                }}>
                {items.map((item) => (
                    <UnifiedItem
                        key={`item-${item.id}`}
                        formId={formId}
                        index={Number(item.id)}
                        shop={shop}
                        items={items}
                        setItems={setItems}
                        updateItem={updateItem}
                        removeItem={removeItem}
                        showQuantity={showQuantity}
                        reset={reset}
                        setReset={setReset}
                    />
                ))}
            </div>

            {/* Sticky stopka z podsumowaniem */}
            <div
                style={{
                    flex: "0 0 auto",
                    padding: "1rem",
                    borderTop: "1px solid #ddd",
                    textAlign: "right",
                }}>
                <strong>Razem: {calculateTotal()} zł</strong>
            </div>
        </form>
    );
};

export default UnifiedForm;

