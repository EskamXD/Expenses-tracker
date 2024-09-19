import { useEffect, useState } from "react";
import SummaryListGroup from "./SummaryListGroup";
import Spinner from "react-bootstrap/Spinner";
import {
    fetchGetMonthlyBalance,
    fetchLineSums,
    fetchPostReceipt,
} from "../services/apiService";
import { Params, Receipt } from "../types";
import { Modal } from "react-bootstrap";

const BalanceTab = () => {
    const [balanceData, setBalanceData] = useState({
        total_income: 0,
        total_expense: 0,
        balance: 0,
    });
    const [selectedOwner, setSelectedOwner] = useState(-1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(
        new Date().getMonth() + 1
    );
    const [itemsLoaded, setItemsLoaded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const calculateBalance = async (params: Params) => {
        const response = await fetchLineSums(params);

        const totalIncome =
            response.linearIncomeSums[response.linearIncomeSums.length - 1] ||
            0;
        const totalExpense =
            response.linearExpenseSums[response.linearExpenseSums.length - 1] ||
            0;

        setBalanceData({
            total_income: Number(totalIncome.toFixed(2)),
            total_expense: Number(totalExpense.toFixed(2)),
            balance: totalIncome - totalExpense,
        });
        return {
            total_income: Number(totalIncome),
            total_expense: Number(totalExpense),
            balance: Math.round((totalIncome - totalExpense) * 100) / 100,
        };
    };

    const addNewBalance = async (params: Params) => {
        params.month = selectedMonth - 1;
        const balance = await calculateBalance(params);

        if (!params.owner) return;
        const receipt: Receipt[] = [
            {
                payment_date: `${selectedYear}-${selectedMonth}-01`,
                payer: params.owner,
                shop: "",
                transaction_type: "income",
                items: [
                    {
                        category: "last_month_balance",
                        value: Number(balance.balance.toFixed(2)),
                        description: "saldo",
                        quantity: 1,
                        owner: params.owner,
                    },
                ],
            },
        ];

        const response = await fetchPostReceipt(receipt);
        if (response.status === 201) {
            setItemsLoaded(true);
            setShowModal(false);
        }
    };

    useEffect(() => {
        const fetchBalanceData = async () => {
            if (selectedOwner === -1) return;

            setLoading(true);
            const params: Params = {
                owner: selectedOwner,
                year: selectedYear,
                month: selectedMonth,
            };

            const response = await fetchGetMonthlyBalance(params);
            if (response.length === 0) {
                setShowModal(true);
            } else {
                const calculateResponse = calculateBalance(params);

                setBalanceData({
                    total_expense:
                        Math.round(
                            (await calculateResponse).total_expense * 100
                        ) / 100,
                    total_income:
                        Math.round(
                            (await calculateResponse).total_income * 100
                        ) / 100,
                    balance:
                        Math.round((await calculateResponse).balance * 100) /
                        100,
                });
                setItemsLoaded(true);
            }
            setLoading(false);
        };

        fetchBalanceData();
    }, [selectedMonth, selectedYear, selectedOwner]);

    const handleModalClose = () => setShowModal(false);

    return (
        <div>
            <h2>Miesięczne saldo</h2>
            <SummaryListGroup
                selectedOwner={selectedOwner}
                setSelectedOwner={setSelectedOwner}
                selectedYear={selectedYear}
                setSelectedYear={setSelectedYear}
                selectedMonth={selectedMonth}
                setSelectedMonth={setSelectedMonth}
                itemsLoaded={itemsLoaded}
            />
            {loading ? (
                <Spinner animation="border" role="status">
                    <span className="sr-only"></span>
                </Spinner>
            ) : (
                <div className="mt-1rem">
                    {itemsLoaded ? (
                        <>
                            <p>
                                <strong>Przychody:</strong>{" "}
                                {balanceData.total_income} zł
                            </p>
                            <p>
                                <strong>Wydatki:</strong>{" "}
                                {balanceData.total_expense} zł
                            </p>
                            <p>
                                <strong>Saldo:</strong> {balanceData.balance} zł
                            </p>
                        </>
                    ) : (
                        <h3>Brak danych do wyświetlenia</h3>
                    )}
                </div>
            )}
            <Modal
                show={showModal}
                onHide={handleModalClose}
                backdrop="static"
                keyboard={false}>
                <Modal.Header closeButton>
                    <Modal.Title>Brak danych</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>
                        Nie znaleziono miesięcznego balansu. Czy chcesz dodać go
                        do tego miesiąca?
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <button
                        className="btn btn-secondary"
                        onClick={handleModalClose}>
                        Anuluj
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={() =>
                            addNewBalance({
                                owner: selectedOwner,
                                year: selectedYear,
                                month: selectedMonth,
                            })
                        }>
                        Dodaj
                    </button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default BalanceTab;
