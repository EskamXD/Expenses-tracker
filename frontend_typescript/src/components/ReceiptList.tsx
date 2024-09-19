// src/components/ReceiptList.jsx

import { useState } from "react";
import ReceiptModal from "./ReceiptModal";
import { Accordion, Button } from "react-bootstrap";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import { selectTranslationList } from "../config/selectOption";
import { Col, Row } from "react-bootstrap";
import "../assets/styles/main.css";

import { Receipt } from "../types";

interface ReceiptListProps {
    receipts: Receipt[];
    transactionType: string;
    setReload: Function;
}

const ReceiptList: React.FC<ReceiptListProps> = ({
    receipts,
    transactionType,
    setReload,
}) => {
    // State to keep track of which modal is open
    const [activeModalId, setActiveModalId] = useState(0);

    // Function to open a specific modal
    const handleShowModal = (id: number) => {
        setActiveModalId(id);
    };

    // Function to close the modal
    const handleCloseModal = () => {
        setActiveModalId(0);
    };

    return (
        <div>
            {receipts.map((receipt) => (
                <div key={receipt.id} className="mb-1rem">
                    <Row>
                        <Col>
                            <h2>{receipt.shop}</h2>
                            <h4>{receipt.payment_date}</h4>
                        </Col>
                        <Col align={"end"}>
                            <Button
                                key={receipt.id}
                                id={`edit-button-${receipt.id}`}
                                onClick={() =>
                                    handleShowModal(Number(receipt.id))
                                }
                                variant="light">
                                <EditRoundedIcon />
                            </Button>
                        </Col>
                    </Row>
                    <Accordion className="mb-3">
                        <Accordion.Item eventKey="0">
                            <Accordion.Header>Pełny paragon</Accordion.Header>
                            <Accordion.Body>
                                {receipt.items.map((item) => (
                                    <div key={item.id}>
                                        <p>
                                            {selectTranslationList.find(
                                                (option) =>
                                                    option.value ===
                                                    item.category
                                            )?.label || item.category}
                                        </p>
                                        <p>
                                            <strong>Opis:</strong>{" "}
                                            {item.description}
                                        </p>
                                        <p>
                                            <strong>Cena:</strong> {item.value}{" "}
                                            zł
                                        </p>
                                        <hr />
                                    </div>
                                ))}
                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                    {/* <Col> */}
                    <h4>
                        Suma:{" "}
                        {receipt.items
                            .map((item) => Number(item.value))
                            .reduce((a, b) => a + b, 0)
                            .toFixed(2)}{" "}
                        zł
                    </h4>
                    <hr />
                    {/* </Col> */}
                    <ReceiptModal
                        receipt={receipt}
                        transactionType={transactionType}
                        show={activeModalId === receipt.id}
                        handleClose={handleCloseModal}
                        setReload={setReload}
                    />
                </div>
            ))}
        </div>
    );
};

export default ReceiptList;
