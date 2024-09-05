/**
 * @file SummaryTable.jsx
 * @brief A React component for displaying a summary table of items.
 */

import React, { useState, useEffect } from "react";
import { Table } from "react-bootstrap";
import TableRow from "./TableRow";
import ReceiptOffcanvas from "./ReceiptOffcanvas";
import "../assets/styles/main.css";

/**
 * @brief Renders a summary table for a list of items.
 *
 * @param {Object[]} list - The list of items to display in the table.
 * @param {string} transactionType - The type of transaction to display.
 * @param {string} selectedOwner - The owner to filter transactions by.
 * @param {Function} setReload - A function to trigger a reload of data.
 *
 * @return {JSX.Element} A table component for displaying and managing a list of items.
 */
const SummaryTable = ({
    list,
    transactionType,
    selectedOwner,
    reload,
    setReload,
}) => {
    const [sortConfig, setSortConfig] = useState({
        key: null,
        direction: null,
    });
    const [groupedList, setGroupedList] = useState([]);
    const [showOffcanvas, setShowOffcanvas] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);

    /**
     * @brief Handles closing the ReceiptOffcanvas component.
     */
    const handleClose = () => {
        setShowOffcanvas(false);
        setSelectedCategory(null);
        setSelectedDate(null);
    };

    /**
     * @brief Handles showing detailed receipt information in the offcanvas.
     *
     * This function extracts the date and category from the clicked row and sets state to display the `ReceiptOffcanvas`.
     *
     * @param {Object} listRow - The clicked row item containing date and category.
     */
    const handleShow = (listRow) => {
        setSelectedDate(listRow.payment_date);
        setSelectedCategory(listRow.category);
        setShowOffcanvas(true);
    };

    /**
     * @brief Sorts the list of items based on a specified key and direction.
     */
    const sortList = (list, key, direction) => {
        return [...list].sort((a, b) => {
            let aValue = a[key];
            let bValue = b[key];

            if (!isNaN(aValue) && !isNaN(bValue)) {
                aValue = parseFloat(aValue);
                bValue = parseFloat(bValue);
            }

            if (aValue < bValue) {
                return direction === "ascending" ? -1 : 1;
            }
            if (aValue > bValue) {
                return direction === "ascending" ? 1 : -1;
            }
            return 0;
        });
    };

    /**
     * @brief Requests a sort on the list based on a key.
     */
    const requestSort = (key) => {
        let direction = "ascending";
        if (sortConfig.key === key && sortConfig.direction === "ascending") {
            direction = "descending";
        }
        setSortConfig({ key, direction });

        const sorted = sortList(groupedList, key, direction);
        setGroupedList(sorted);
    };

    /**
     * @brief Returns a sort indicator for table headers.
     */
    const getSortIndicator = (key) => {
        if (sortConfig.key === key) {
            return sortConfig.direction === "ascending" ? " ▲" : " ▼";
        }
        return "";
    };

    /**
     * @brief Groups the list by category and payment date, summing their values.
     */
    useEffect(() => {
        if (!list || list.length === 0) {
            setGroupedList([]);
            return;
        }

        const grouped = {};

        list.forEach((listItem) => {
            listItem.transactions
                .filter((transaction) => transaction.owner === selectedOwner)
                .forEach((transaction) => {
                    const key = `${transaction.category}-${listItem.payment_date}`;

                    if (!grouped[key]) {
                        grouped[key] = {
                            id: `${listItem.id}-${transaction.category}`, // Ensure unique ID
                            category: transaction.category,
                            value: parseFloat(transaction.value),
                            payment_date: listItem.payment_date,
                            description: transaction.description,
                        };
                    } else {
                        grouped[key].value += parseFloat(transaction.value);
                    }
                });
        });

        setGroupedList(Object.values(grouped));
    }, [list, selectedOwner]);

    return (
        <>
            <Table striped bordered hover style={{ width: "100%" }}>
                <thead>
                    <tr key="header">
                        <th
                            onClick={() => requestSort("category")}
                            style={{ userSelect: "none" }}>
                            Kategoria {getSortIndicator("category")}
                        </th>
                        <th
                            onClick={() => requestSort("value")}
                            style={{ userSelect: "none" }}>
                            Kwota (PLN) {getSortIndicator("value")}
                        </th>
                        <th
                            onClick={() => requestSort("payment_date")}
                            style={{ userSelect: "none" }}>
                            Data {getSortIndicator("payment_date")}
                        </th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {groupedList.length === 0 && (
                        <tr>
                            <td colSpan={4}>
                                Nie znaleziono żadnych{" "}
                                {transactionType === "expense"
                                    ? "wydatków"
                                    : "przychodów"}
                            </td>
                        </tr>
                    )}
                    {groupedList.map((listRow) => (
                        <TableRow
                            key={listRow.id}
                            listRow={listRow}
                            handleShow={() => handleShow(listRow)}
                            transactionType={transactionType}
                        />
                    ))}
                </tbody>
            </Table>
            {selectedDate && selectedCategory && (
                <ReceiptOffcanvas
                    show={showOffcanvas}
                    setShowOffcanvas={setShowOffcanvas}
                    handleClose={handleClose}
                    selectedDate={selectedDate}
                    selectedCategory={selectedCategory}
                    loading={false}
                    transactionType={transactionType}
                    selectedOwner={selectedOwner}
                    reload={reload}
                    setReload={setReload}
                />
            )}
        </>
    );
};

export default SummaryTable;
