import React, { useState, useEffect } from "react";
import { Form, Modal, Button } from "react-bootstrap";
import ReceiptDetails from "./ReceiptDetails";
import "../assets/styles/main.css";
import PayerDropdown from "./PayerDropdown";
import moment from "moment";

import { Item, Receipt } from "../types";
import { fetchPutReceipt, fetchDeleteReceipt } from "../services/apiService";

interface ReceiptModalProps {
    receipt: Receipt;
    transactionType: string;
    show: boolean;
    handleClose: () => void;
    setReload: Function;
}

const ReceiptModal: React.FC<ReceiptModalProps> = ({
    receipt,
    transactionType,
    show,
    handleClose,
    setReload,
}) => {
    const [items, setItems] = useState<Item[]>([]);
    const [newShop, setNewShop] = useState("");
    const [newPaymentDate, setNewPaymentDate] = useState("");
    const [newPayer, setNewPayer] = useState(0);

    useEffect(() => {
        if (receipt && receipt.items) {
            setItems(receipt.items);
            setNewShop(receipt.shop);
            setNewPaymentDate(receipt.payment_date);
            setNewPayer(receipt.payer);
        }
    }, [receipt]);

    const handleSave = async () => {
        const receiptData: Receipt = {
            id: receipt.id,
            payment_date: newPaymentDate,
            payer: newPayer,
            shop: newShop,
            transaction_type: transactionType,
            items: items,
        };
        await fetchPutReceipt(receiptData);
        handleClose();
        setReload(true);
    };

    const handleDelete = async () => {
        const answer = confirm("Czy na pewno chcesz usunąć ten wpis?");
        if (!answer) {
            return;
        }
        await fetchDeleteReceipt(receipt);
        handleClose();
        setReload(true);
    };

    const handleShopChange = (e: any) => {
        setNewShop(e.target.value);
    };

    const handleDateChange = (e: any) => {
        const newDate = moment(e.target.value).format("YYYY-MM-DD");
        setNewPaymentDate(newDate);
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
                    <Modal.Title>Edytuj paragon</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ maxHeight: "70vh", overflowY: "scroll" }}>
                    <Form.Control
                        type="text"
                        className="mb-3"
                        value={newShop}
                        onChange={handleShopChange}
                    />
                    <div className="d-flex mb-3">
                        <Form.Control
                            id="modal-calendar"
                            type="date"
                            className="mr-1rem"
                            value={newPaymentDate} // Ensuring form uses state for date
                            onChange={handleDateChange}
                        />
                        <PayerDropdown
                            payer={newPayer}
                            setPayer={setNewPayer}
                        />
                    </div>
                    <hr></hr>
                    {items.length > 0 ? (
                        <ReceiptDetails
                            items={items}
                            setItems={setItems}
                            transactionType={transactionType}
                        />
                    ) : (
                        <p>Brak danych do edycji</p>
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
