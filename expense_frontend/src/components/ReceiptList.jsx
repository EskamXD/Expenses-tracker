// src/components/ReceiptList.jsx

import React, { useState } from "react";
import ReceiptModal from "./ReceiptModal";
import { Button } from "react-bootstrap";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import { selectTranslationList } from "../config/selectOption";
import "../assets/styles/main.css";

const ReceiptList = ({ list, transactionType, selectedOwner, setReload }) => {
    // State to keep track of which modal is open
    const [activeModalId, setActiveModalId] = useState(null);

    // Function to open a specific modal
    const handleShowModal = (id) => {
        setActiveModalId(id);
    };

    // Function to close the modal
    const handleCloseModal = () => {
        setActiveModalId(null);
    };

    return (
        <div>
            {list.map((listItem) => (
                <div key={listItem.id}>
                    <div className="d-flex gap-2 space-between">
                        <div>
                            <h2>{listItem.shop}</h2>
                            <h4>{listItem.payment_date}</h4>
                        </div>
                        <div>
                            <Button
                                key={listItem.id}
                                id={`edit-button-${listItem.id}`}
                                onClick={() => handleShowModal(listItem.id)}
                                variant="light">
                                <EditRoundedIcon />
                            </Button>
                        </div>
                    </div>
                    {listItem.transactions.map((transaction) => (
                        <div key={transaction.id}>
                            <p>
                                {selectTranslationList.find(
                                    (option) =>
                                        option.value === transaction.category
                                )?.label || transaction.category}
                            </p>
                            <p>
                                <strong>Opis:</strong> {transaction.description}
                            </p>
                            <p>
                                <strong>Cena:</strong> {transaction.value} zł
                            </p>
                            <hr />
                        </div>
                    ))}
                    <ReceiptModal
                        listItem={listItem}
                        transactionType={transactionType}
                        selectedOwner={selectedOwner}
                        show={activeModalId === listItem.id}
                        handleClose={handleCloseModal}
                        setReload={setReload}
                    />
                </div>
            ))}
        </div>
    );
};

export default ReceiptList;
