import React, { useEffect, useState } from "react";
import Accordion from "react-bootstrap/Accordion";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import { Col, Row } from "react-bootstrap";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

import UnifiedForm from "../components/UnifiedForm";

import { selectTranslationList } from "../config/selectOption";
import { useGlobalContext } from "../context/GlobalContext";
import {
    fetchGetReceipts,
    fetchPutReceipt,
    fetchDeleteReceipt,
} from "../api/apiService";
import { Item, Params, Receipt } from "../types";
// import "../assets/styles/glassTable.css";

interface SummaryTableProps {
    transactionType: "income" | "expense";
}

interface ProcessedReceiptForAccordion {
    date: string;
    receipts: {
        id: number;
        shop: string;
        totalValue: number;
        payer: string;
        categories: string[];
        keywords: string[];
    }[];
}

const SummaryTable: React.FC<SummaryTableProps> = ({ transactionType }) => {
    const { persons, filteredReceipts } = useGlobalContext();
    const [groupedReceipts, setGroupedReceipts] = useState<
        ProcessedReceiptForAccordion[]
    >([]);

    const [searchQuery, setSearchQuery] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [selectedGroup, setSelectedGroup] =
        useState<ProcessedReceiptForAccordion | null>(null);
    const [editingReceipt, setEditingReceipt] = useState<Receipt | null>(null); // Pełny obiekt paragonu
    const [editModalVisible, setEditModalVisible] = useState(false);

    const getPersonNameById = (id: number | string): string => {
        const person = persons.find((person) => person.id === Number(id));
        return person ? person.name : "Unknown";
    };

    useEffect(() => {
        const grouped: {
            [date: string]: ProcessedReceiptForAccordion["receipts"];
        } = {};

        filteredReceipts.forEach((receipt) => {
            if (receipt.transaction_type !== transactionType) {
                return;
            }

            const totalValue = receipt.items.reduce(
                (sum: number, item: Item) => sum + parseFloat(item.value),
                0
            );

            const uniqueCategories = Array.from(
                new Set(receipt.items.map((item: Item) => item.category))
            );

            const keywords = receipt.items
                .map((item: Item) => item.description.toLowerCase())
                .filter(Boolean); // Usuwa puste wartości

            if (!grouped[receipt.payment_date]) {
                grouped[receipt.payment_date] = [];
            }

            grouped[receipt.payment_date].push({
                id: Number(receipt.id),
                shop: receipt.shop,
                totalValue,
                payer: getPersonNameById(receipt.payer),
                categories: uniqueCategories,
                keywords: keywords,
            });
        });

        const processedData: ProcessedReceiptForAccordion[] = Object.entries(
            grouped
        ).map(([date, receipts]) => ({
            date,
            receipts,
        }));

        setGroupedReceipts(processedData);
    }, [filteredReceipts, transactionType]);

    // Filtruj dane na podstawie frazy wyszukiwania
    const filteredGroupedReceipts = groupedReceipts
        .map((group) => ({
            ...group,
            receipts: group.receipts.filter((receipt) => {
                const query = searchQuery.toLowerCase();

                const categoryLabels = receipt.categories
                    .map((category) => {
                        const translation = selectTranslationList.find(
                            (item) => item.value === category
                        );
                        return translation
                            ? translation.label.toLowerCase()
                            : null;
                    })
                    .filter(Boolean);

                return (
                    receipt.shop.toLowerCase().includes(query) ||
                    receipt.payer.toLowerCase().includes(query) ||
                    receipt.categories.some((category) =>
                        category.toLowerCase().includes(query)
                    ) ||
                    categoryLabels.some(
                        (label) => label && label.includes(query)
                    ) ||
                    receipt.keywords.some((keyword) => keyword.includes(query))
                );
            }),
        }))
        .filter((group) => group.receipts.length > 0);

    const handleShowModal = (group: ProcessedReceiptForAccordion) => {
        setSelectedGroup(group);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setSelectedGroup(null);
        setShowModal(false);
    };

    const fetchReceiptDetails = async (receiptId: number) => {
        const params = {
            id: receiptId,
        } as Params;

        try {
            const response = await fetchGetReceipts(params);
            setEditingReceipt(response[0]); // Pobierz pierwszy wynik
            setEditModalVisible(true);
        } catch (error) {
            console.error("Nie udało się pobrać szczegółów paragonu", error);
        }
    };

    const handleSaveReceipt = async (receipt: Receipt) => {
        if (!receipt.id) return;
        try {
            await fetchPutReceipt(receipt.id, receipt);
            alert("Zapisano zmiany!");
            setEditModalVisible(false);
            setEditingReceipt(null);
        } catch (error) {
            console.error("Nie udało się zapisać paragonu", error);
        }
    };

    const handleDeleteReceipt = async (receipt: Receipt) => {
        if (!receipt.id) return;
        if (!window.confirm("Czy na pewno chcesz usunąć ten paragon?")) return;

        try {
            await fetchDeleteReceipt(receipt);
            alert("Paragon usunięty!");
            setEditModalVisible(false);
            setEditingReceipt(null);
        } catch (error) {
            console.error("Nie udało się usunąć paragonu", error);
        }
    };

    return (
        <div className="summary-table-container">
            <div className="glass-bg">
                <Form.Group className="mb-3" controlId="search">
                    <Form.Label>Wyszukaj</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Wyszukaj po sklepie, płacącym lub kategorii"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </Form.Group>
                <div className="scrollable-content">
                    <Accordion defaultActiveKey="0" className="accordion">
                        {filteredGroupedReceipts.map((group, index) => (
                            <Accordion.Item
                                eventKey={index.toString()}
                                key={group.date}
                                className="accordion-item">
                                <Accordion.Header className="accordion-header">
                                    {group.date}
                                </Accordion.Header>
                                <Accordion.Body className="accordion-body">
                                    {group.receipts.map((receipt) => (
                                        <Row key={receipt.id} className="mb-3">
                                            <Col>{receipt.shop}</Col>
                                            <Col>
                                                {receipt.totalValue.toFixed(2)}{" "}
                                                PLN
                                            </Col>
                                            <Col>{receipt.payer}</Col>
                                            <Col>
                                                {receipt.categories.map(
                                                    (category) => {
                                                        const translation =
                                                            selectTranslationList.find(
                                                                (i) =>
                                                                    i.value ===
                                                                    category
                                                            );
                                                        return (
                                                            <p key={category}>
                                                                {translation
                                                                    ? translation.label
                                                                    : "Unknown"}
                                                            </p>
                                                        );
                                                    }
                                                )}
                                            </Col>
                                            <Col className="button-container">
                                                <Button
                                                    variant="light"
                                                    onClick={() =>
                                                        handleShowModal(group)
                                                    } // Funkcja otwierająca modal
                                                >
                                                    <ArrowForwardIosIcon />
                                                </Button>
                                            </Col>
                                        </Row>
                                    ))}
                                </Accordion.Body>
                            </Accordion.Item>
                        ))}
                    </Accordion>
                </div>
            </div>

            {/* Modal */}
            {selectedGroup && (
                <Modal
                    show={showModal}
                    onHide={handleCloseModal}
                    size="lg"
                    centered>
                    <Modal.Header closeButton>
                        <Modal.Title>
                            Paragony z dnia {selectedGroup.date}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {selectedGroup.receipts.map((receipt) => {
                            // Wyciągnięcie unikalnych kategorii
                            const uniqueCategories = Array.from(
                                new Set(receipt.categories)
                            );

                            return (
                                <div key={receipt.id} className="mb-3">
                                    <p>
                                        <strong>Sklep:</strong> {receipt.shop}
                                    </p>
                                    <p>
                                        <strong>Płacący:</strong>{" "}
                                        {receipt.payer}
                                    </p>
                                    <p>
                                        <strong>Wartość:</strong>{" "}
                                        {receipt.totalValue.toFixed(2)} PLN
                                    </p>
                                    <p>
                                        <strong>Kategorie:</strong>{" "}
                                        {uniqueCategories.map((category) => {
                                            const translation =
                                                selectTranslationList.find(
                                                    (item) =>
                                                        item.value === category
                                                );
                                            return (
                                                <span
                                                    key={category}
                                                    className="badge bg-primary me-2">
                                                    {translation
                                                        ? translation.label
                                                        : "Nieznane"}
                                                </span>
                                            );
                                        })}
                                    </p>
                                    <p>
                                        <strong>Rzeczy: </strong>
                                        {receipt.keywords.map(
                                            (keyword) => `${keyword}, `
                                        )}
                                    </p>
                                    {/* Możliwość edycji */}
                                    <Button
                                        variant="outline-primary"
                                        className="mt-2"
                                        onClick={() =>
                                            fetchReceiptDetails(receipt.id)
                                        }>
                                        Edytuj
                                    </Button>
                                    <hr />
                                </div>
                            );
                        })}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseModal}>
                            Zamknij
                        </Button>
                    </Modal.Footer>
                </Modal>
            )}

            {editingReceipt && (
                <Modal
                    show={editModalVisible}
                    onHide={() => {
                        setEditModalVisible(false);
                        setEditingReceipt(null);
                    }}
                    backdrop="static"
                    fullscreen={true}
                    centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Edytuj paragon</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <UnifiedForm
                            formId={
                                transactionType === "expense"
                                    ? "expense-form"
                                    : "income-form"
                            }
                            buttonLabel="Zapisz zmiany"
                            showShop={true}
                            showQuantity={true}
                            receipt={editingReceipt}
                        />
                        {/* <Button
                            variant="secondary"
                            className="mt-3"
                            onClick={() => handleSaveReceipt(editingReceipt)}>
                            Zapisz paragon
                        </Button> */}
                        <Button
                            variant="danger"
                            className="mt-3"
                            onClick={() => handleDeleteReceipt(editingReceipt)}>
                            Usuń paragon
                        </Button>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button
                            variant="secondary"
                            onClick={() => {
                                setEditModalVisible(false);
                                setEditingReceipt(null);
                            }}>
                            Anuluj
                        </Button>
                    </Modal.Footer>
                </Modal>
            )}
        </div>
    );
};

export default SummaryTable;

