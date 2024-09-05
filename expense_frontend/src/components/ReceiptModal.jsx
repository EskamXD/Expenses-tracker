import React, { useState, useEffect } from "react";
import { Alert, Modal, Button } from "react-bootstrap";
import axios from "axios";
import ReceiptDetails from "./ReceiptDetails";
import "../assets/styles/main.css";

const ReceiptModal = ({
    listItem,
    transactionType,
    selectedOwner,
    show,
    handleClose,
    setReload,
}) => {
    // Initialize transactions with an empty array to avoid undefined errors
    const [transactions, setTransactions] = useState([]);

    // Set transactions when the listItem prop changes
    useEffect(() => {
        if (listItem && listItem.transactions) {
            setTransactions(listItem.transactions);
        }
    }, [listItem]);

    const handleSave = async () => {
        const receiptData = {
            payment_date: listItem.payment_date,
            payer: listItem.payer,
            shop: listItem.shop,
            transaction_type: transactionType,
            transactions,
        };
        try {
            const response = await axios.put(
                `http://localhost:8000/api/receipts/${listItem.id}/`,
                receiptData
            );
            setTransactions(response.data.transactions);
        } catch (error) {
            console.error("Error updating receipt data:", error);
        }
        handleClose();
        setReload(true);
    };

    const handleDelete = () => {
        const anwer = confirm("Czy na pewno chcesz usunąć ten wpis?");
        if (!anwer) {
            return;
        }
        const fetchDelete = async () => {
            try {
                await axios.delete(
                    `http://localhost:8000/api/receipts/${listItem.id}/`
                );
            } catch (error) {
                console.error("Error deleting receipt:", error);
            }
        };
        handleClose();
        fetchDelete();
        setReload(true);
    };

    return (
        <>
            <Modal
                show={show}
                onHide={handleClose}
                backdrop="static"
                centered
                dialogClassName="modal-90w">
                <Modal.Header closeButton>
                    <Modal.Title>Edit Receipt</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {transactions.length > 0 ? (
                        <ReceiptDetails
                            transactions={transactions}
                            setTransactions={setTransactions}
                            transactionType={transactionType}
                            selectedOwner={selectedOwner}
                        />
                    ) : (
                        <p>No transactions available to edit.</p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <div className="d-flex space-between">
                        <Button variant="danger" onClick={handleDelete}>
                            Usuń
                        </Button>
                        <div className="d-flex gap-2">
                            <Button variant="secondary" onClick={handleClose}>
                                Anuluj
                            </Button>
                            <Button variant="success" onClick={handleSave}>
                                Zapisz
                            </Button>
                        </div>
                    </div>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default ReceiptModal;
