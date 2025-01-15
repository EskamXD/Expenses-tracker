import React, { useState, useEffect } from "react";
import { Table } from "react-bootstrap";
import TableRow from "./TableRow";
import ReceiptOffcanvas from "./ReceiptOffcanvas";
import "../assets/styles/main.css";
import { Item, Receipt } from "../types";

interface GroupedItem {
    id: string;
    category: string;
    value: number;
    payment_date: string;
}

interface SortConfig {
    key: string;
    direction: "ascending" | "descending";
}

interface SummaryTableProps {
    receiptsLoaded: boolean;
    receipts: Receipt[];
    transactionType: string;
    selectedOwner: number;
    reload: boolean;
    setReload: React.Dispatch<React.SetStateAction<boolean>>;
}

const SummaryTable: React.FC<SummaryTableProps> = ({
    receiptsLoaded,
    receipts,
    transactionType,
    selectedOwner,
    reload,
    setReload,
}) => {
    const [sortConfig, setSortConfig] = useState<SortConfig>({
        key: "",
        direction: "ascending",
    });
    const [groupedItems, setGroupedItems] = useState<GroupedItem[]>([]);
    const [showOffcanvas, setShowOffcanvas] = useState<boolean>(false);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(
        null
    );
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    const handleClose = () => {
        setShowOffcanvas(false);
        setSelectedCategory(null);
        setSelectedDate(null);
    };

    const handleShow = (itemRow: GroupedItem) => {
        setSelectedDate(itemRow.payment_date);
        setSelectedCategory(itemRow.category);
        setShowOffcanvas(true);
    };

    const sortList = (
        items: GroupedItem[],
        key: string,
        direction: "ascending" | "descending"
    ): GroupedItem[] => {
        return [...items].sort((a, b) => {
            let aValue = a[key as keyof GroupedItem];
            let bValue = b[key as keyof GroupedItem];

            if (typeof aValue === "string" && !isNaN(Number(aValue))) {
                aValue = parseFloat(aValue as any);
                bValue = parseFloat(bValue as any);
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

    const requestSort = (key: keyof GroupedItem) => {
        let direction: "ascending" | "descending" = "ascending";
        if (sortConfig.key === key && sortConfig.direction === "ascending") {
            direction = "descending";
        }
        setSortConfig({ key, direction });

        const sorted = sortList(groupedItems, key, direction);
        setGroupedItems(sorted);
    };

    const getSortIndicator = (key: keyof GroupedItem) => {
        if (sortConfig.key === key) {
            return sortConfig.direction === "ascending" ? " ▲" : " ▼";
        }
        return "";
    };

    useEffect(() => {
        if (!receipts || receipts.length === 0) {
            setGroupedItems([]);
            return;
        }

        const grouped: { [key: string]: GroupedItem } = {};
        let usedReceipts = [] as number[];

        receipts.forEach((receipt) => {
            const filteredItems =
                selectedOwner === 100
                    ? receipt.items
                    : receipt.items.filter(
                          (item: Item) => Number(item.owner) === selectedOwner
                      );

            if (usedReceipts.includes(Number(receipt.id))) {
                console.warn("receipt already used");
                return;
            }

            if (filteredItems.length !== 0) {
                usedReceipts.push(Number(receipt.id));

                filteredItems.forEach((item) => {
                    const key = `${item.category}-${receipt.payment_date}`;

                    // Konwersja wartości z walidacją
                    const itemValue = Number(Number(item.value).toFixed(2));
                    if (isNaN(itemValue)) {
                        console.warn(`Nieprawidłowa wartość: ${item.value}`);
                        return; // Pomijaj elementy z nieprawidłową wartością
                    }

                    if (!grouped[key]) {
                        grouped[key] = {
                            id: `${receipt.id}-${item.category}`,
                            category: item.category,
                            value: 0,
                            payment_date: receipt.payment_date,
                        };
                    }

                    // Sumuj wartość
                    grouped[key].value += itemValue;
                });
            }
        });

        setGroupedItems(Object.values(grouped));
    }, [receiptsLoaded]);

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
                    {groupedItems.length === 0 && (
                        <tr>
                            <td colSpan={4}>
                                Nie znaleziono żadnych{" "}
                                {transactionType === "expense"
                                    ? "wydatków"
                                    : "przychodów"}
                            </td>
                        </tr>
                    )}
                    {groupedItems.map((itemRow) => (
                        <TableRow
                            key={itemRow.id}
                            listRow={itemRow}
                            handleShow={() => handleShow(itemRow)}
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

