import { useState, useEffect } from "react";
import { Button, Modal, Spinner, Table } from "react-bootstrap";
import {
    fetchGetReceipts,
    fetchPostReceipt,
    fetchPutReceipt,
} from "../api/apiService";
import { Params, Receipt, Item } from "../types";
import SummaryListGroup from "../components/SummaryListGroup";
import CallSplitIcon from "@mui/icons-material/CallSplit";
import PayerDropdown from "../components/PayerDropdown";
import { getPersonOption } from "../utils/getPersonOption";

interface ComparePayerBillInterface {
    payer: number;
    sumOfCommonBills: number;
}

const FlatBills = () => {
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(
        new Date().getMonth() + 1
    );
    const [receiptBills, setReceiptBills] = useState<Receipt[]>([]);
    const [comparePayerBills, setComparePayerBills] = useState<
        ComparePayerBillInterface[]
    >([]);
    const [loading, setLoading] = useState(false);
    const [newPayer, setNewPayer] = useState<number | null>(null);
    const [reload, setReload] = useState(false);
    const [selectedBillReceipt, setSelectedBillReceipt] =
        useState<Receipt | null>(null);
    const [sendingBillUpdate, setSendingBillUpdate] = useState(false);

    // Fetch receipts
    useEffect(() => {
        const fetchReceipts = async () => {
            setLoading(true);
            const params = {
                year: selectedYear,
                month: selectedMonth,
                category: "flat_bills",
            } as Params;

            try {
                const response = await fetchGetReceipts(params);
                setReceiptBills(response);
                const comparePayerArray = processReceipts(response);
                setComparePayerBills(comparePayerArray);
            } catch (error) {
                console.error("Error fetching receipts", error);
            } finally {
                setLoading(false);
                setReload(false);
            }
        };

        fetchReceipts();
    }, [selectedYear, selectedMonth, reload]);

    const processReceipts = (
        receipts: Receipt[]
    ): ComparePayerBillInterface[] => {
        const comparePayerMap: { [key: number]: ComparePayerBillInterface } =
            {};

        receipts.forEach((receiptBill) => {
            const payer = receiptBill.payer;
            const billValue = Number(receiptBill.items[0].value);

            if (!comparePayerMap[payer]) {
                comparePayerMap[payer] = { payer, sumOfCommonBills: 0 };
            }
            comparePayerMap[payer].sumOfCommonBills += billValue;
        });

        return Object.values(comparePayerMap);
    };

    const handleShowEditSplitModal = (receiptBill: Receipt) => {
        console.log("handleShowEditSplitModal", receiptBill);
        console.log(newPayer);
        setSelectedBillReceipt(receiptBill);
    };

    const handleCloseModal = () => {
        setSelectedBillReceipt(null);
    };

    const handleSplitBill = async (receiptBill: Receipt, payer: number) => {
        setSendingBillUpdate(true);
        const billValue =
            Math.round((Number(receiptBill.items[0].value) / 2) * 100) / 100;

        const newPayerReceipt = {
            payment_date: receiptBill.payment_date,
            payer,
            shop: receiptBill.shop,
            transaction_type: receiptBill.transaction_type,
            items: [
                { ...receiptBill.items[0], value: billValue, owner: payer },
            ] as Item[],
        };

        const oldPayerReceipt = {
            ...receiptBill,
            items: [
                {
                    ...receiptBill.items[0],
                    value: billValue,
                    owner: receiptBill.payer,
                },
            ] as Item[],
        };

        try {
            await fetchPostReceipt([newPayerReceipt]);
            await fetchPutReceipt(Number(receiptBill.id), oldPayerReceipt);
        } catch (error) {
            console.error("Error updating receipts", error);
        } finally {
            setReload(true);
            setSendingBillUpdate(false);
            handleCloseModal();
        }
    };

    return (
        <div>
            <h1>Rachunki</h1>
            <p>Różnice w rachunkach:</p>
            {loading ? (
                <p>Ładowanie...</p>
            ) : (
                <>
                    {comparePayerBills.length > 0 ? (
                        comparePayerBills.map(({ payer, sumOfCommonBills }) => (
                            <p key={payer}>
                                {getPersonOption(payer)}:{" "}
                                {sumOfCommonBills.toFixed(2)} zł
                            </p>
                        ))
                    ) : (
                        <p>Brak rachunków</p>
                    )}
                    <SummaryListGroup
                        selectedYear={selectedYear}
                        setSelectedYear={setSelectedYear}
                        selectedMonth={selectedMonth}
                        setSelectedMonth={setSelectedMonth}
                        itemsLoaded={!loading}
                    />
                    {receiptBills.length > 0 && (
                        <Table striped bordered hover className="mt-1rem">
                            <thead>
                                <tr>
                                    <th>Data</th>
                                    <th>Wartość</th>
                                    <th>Płacił</th>
                                    <th>Opis</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {receiptBills.map((receiptBill) =>
                                    receiptBill.items.map((billItem) => (
                                        <tr key={billItem.id}>
                                            <td>{receiptBill.payment_date}</td>
                                            <td>{billItem.value} zł</td>
                                            <td>
                                                {getPersonOption(
                                                    receiptBill.payer
                                                )}
                                            </td>
                                            <td>{billItem.description}</td>
                                            <td width={"1%"}>
                                                <Button
                                                    variant="light"
                                                    onClick={() =>
                                                        handleShowEditSplitModal(
                                                            receiptBill
                                                        )
                                                    }
                                                    disabled={
                                                        Number(
                                                            billItem.owner
                                                        ) !== 99
                                                    }>
                                                    <CallSplitIcon />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </Table>
                    )}
                </>
            )}
            {/* Modal dla wybranego rachunku */}
            {selectedBillReceipt && (
                <Modal show onHide={handleCloseModal}>
                    <Modal.Header closeButton={!sendingBillUpdate}>
                        <Modal.Title>
                            Edytuj Rachunek:{" "}
                            {selectedBillReceipt.items[0]?.description}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <PayerDropdown
                            label="Nowy płatnik"
                            payer={Number(newPayer)}
                            setPayer={setNewPayer}
                        />
                        <div className="mt-1rem">
                            <p>Data: {selectedBillReceipt.payment_date}</p>
                            <p>
                                Płacił:{" "}
                                {getPersonOption(selectedBillReceipt.payer)}
                            </p>
                            <p>
                                Kwota: {selectedBillReceipt.items[0]?.value} zł
                            </p>
                            <p>
                                Opis:{" "}
                                {selectedBillReceipt.items[0]?.description}
                            </p>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button
                            variant="secondary"
                            onClick={handleCloseModal}
                            disabled={sendingBillUpdate}>
                            Zamknij
                        </Button>
                        <Button
                            style={{ minWidth: "16ch" }}
                            variant="success"
                            onClick={() =>
                                handleSplitBill(selectedBillReceipt, newPayer!)
                            }
                            disabled={sendingBillUpdate}>
                            {sendingBillUpdate ? (
                                <Spinner
                                    size="sm"
                                    animation="border"
                                    role="status"
                                />
                            ) : (
                                "Podziel rachunek"
                            )}
                        </Button>
                    </Modal.Footer>
                </Modal>
            )}
        </div>
    );
};

export default FlatBills;
