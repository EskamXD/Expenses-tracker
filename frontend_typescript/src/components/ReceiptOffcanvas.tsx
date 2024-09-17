/**
 * @file ReceiptOffcanvas.jsx
 * @brief A React component for displaying receipt details in an offcanvas view.
 */

import { useState, useEffect } from "react";
import Spinner from "react-bootstrap/Spinner";
import Offcanvas from "react-bootstrap/Offcanvas";

import ReceiptList from "./ReceiptList";
import "../assets/styles/main.css";

import { Params } from "../types";
import { fetchGetReceipts } from "../services/apiService";

interface ReceiptOffcanvasProps {
    show: boolean;
    setShowOffcanvas: Function;
    handleClose: () => void;
    selectedDate: string;
    selectedCategory: string;
    loading: boolean;
    transactionType: string;
    selectedOwner: number;
    reload: boolean;
    setReload: Function;
}

/**
 * @brief A component for displaying and filtering receipts.
 *
 * @param {boolean} show - Controls the visibility of the offcanvas.
 * @param {Function} handleClose - Function to close the offcanvas.
 * @param {string} selectedDate - The date to filter receipts by.
 * @param {string} selectedCategory - The category to filter receipts by.
 * @param {boolean} loading - Indicates if the data is being loaded.
 * @param {string} transactionType - The type of transaction to display.
 * @param {string} selectedOwner - The owner to filter items by.
 */
const ReceiptOffcanvas: React.FC<ReceiptOffcanvasProps> = ({
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

    const fetchFunction = async () => {
        const params = {
            year: new Date(selectedDate).getFullYear(),
            month: new Date(selectedDate).getMonth() + 1,
            day: new Date(selectedDate).getDate(),
            transaction_type: transactionType,
            category: selectedCategory,
            owner: selectedOwner !== 100 ? selectedOwner : undefined,
        } as Params;

        await fetchGetReceipts(params).then((response) => {
            setFilteredReceipts(response);
        });
    };

    useEffect(() => {
        if (show) {
            fetchFunction();
        }
    }, [show, selectedDate, selectedCategory, transactionType, selectedOwner]);

    useEffect(() => {
        if (reload) {
            setReload(false);
            fetchFunction();
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
                        receipts={filteredReceipts}
                        transactionType={transactionType}
                        setReload={setReload}
                    />
                )}
            </Offcanvas.Body>
        </Offcanvas>
    );
};

export default ReceiptOffcanvas;
