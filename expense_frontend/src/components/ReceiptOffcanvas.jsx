/**
 * @file ReceiptOffcanvas.jsx
 * @brief A React component for displaying receipt details in an offcanvas view.
 */

import React, { useState, useEffect } from "react";
import { Offcanvas, Spinner } from "react-bootstrap";
import ReceiptList from "./ReceiptList";
import axios from "axios";
import "../assets/styles/main.css";

/**
 * @brief A component for displaying and filtering receipts.
 *
 * @param {boolean} show - Controls the visibility of the offcanvas.
 * @param {Function} handleClose - Function to close the offcanvas.
 * @param {string} selectedDate - The date to filter receipts by.
 * @param {string} selectedCategory - The category to filter receipts by.
 * @param {boolean} loading - Indicates if the data is being loaded.
 * @param {string} transactionType - The type of transaction to display.
 * @param {string} selectedOwner - The owner to filter transactions by.
 */
const ReceiptOffcanvas = ({
    show,
    setShowOffcanvas,
    handleClose,
    selectedDate,
    selectedCategory,
    loading,
    transactionType,
    selectedOwner,
    reload,
    setReload,
}) => {
    const [filteredReceipts, setFilteredReceipts] = useState([]);

    const fetchReceipts = async () => {
        const day = new Date(selectedDate).getDate();
        const month = new Date(selectedDate).getMonth() + 1;
        const year = new Date(selectedDate).getFullYear();
        try {
            const response = await axios.get(
                `http://localhost:8000/api/receipts/?year${year}&month=${month}&day=${day}&transaction_type=${transactionType}`
            );

            const filteredByCategory = response.data.filter((receipt) =>
                receipt.transactions.some(
                    (transaction) =>
                        transaction.category === selectedCategory &&
                        transaction.owner === selectedOwner
                )
            );

            setFilteredReceipts(filteredByCategory);
        } catch (error) {
            console.error("Error fetching receipts:", error);
        }
    };

    useEffect(() => {
        if (show) {
            fetchReceipts();
        }
    }, [show, selectedDate, selectedCategory, transactionType, selectedOwner]);

    useEffect(() => {
        if (reload) {
            setReload(false);
            fetchReceipts();
            setShowOffcanvas(true);
        }
    }, [reload]);

    return (
        <Offcanvas show={show} onHide={handleClose}>
            <Offcanvas.Header closeButton>
                <Offcanvas.Title>Receipt Details</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
                {loading ? (
                    <Spinner animation="border" role="status">
                        <span className="sr-only"></span>
                    </Spinner>
                ) : filteredReceipts.length === 0 ? (
                    <p>No receipt data available.</p>
                ) : (
                    <ReceiptList
                        list={filteredReceipts}
                        transactionType={transactionType}
                        selectedOwner={selectedOwner}
                        setReload={setReload}
                    />
                )}
            </Offcanvas.Body>
        </Offcanvas>
    );
};

export default ReceiptOffcanvas;
