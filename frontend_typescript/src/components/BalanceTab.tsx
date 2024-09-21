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

interface calculatedBalanceInterface {
    total_income: number;
    total_expense: number;
    balance: number;
}

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
    const [loading, setLoading] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [calculatedBalance, setCalculatedBalance] =
        useState<calculatedBalanceInterface | null>(null); //prettier-ignore
    const [itemsLoaded, setItemsLoaded] = useState(false);

    const calculateBalance = async (params: Params) => {
        const response = await fetchLineSums(params);
        const totalIncome = response.linearIncomeSums.slice(-1)[0] || 0;
        const totalExpense = response.linearExpenseSums.slice(-1)[0] || 0;

        return {
            total_income: Number(totalIncome.toFixed(2)),
            total_expense: Number(totalExpense.toFixed(2)),
            balance: Number((totalIncome - totalExpense).toFixed(2)),
        };
    };

    const handleReceipt = async (params: Params, balance: any) => {
        const receipt: Receipt[] = [
            {
                payment_date: `${selectedYear}-${selectedMonth}-01`,
                payer: Number(params.owner),
                shop: "",
                transaction_type: "income",
                items: [
                    {
                        category: "last_month_balance",
                        value: balance.balance,
                        description: "saldo",
                        quantity: 1,
                        owner: Number(params.owner),
                    },
                ],
            },
        ];

        const response = await fetchPostReceipt(receipt);
        if (response.status === 201) {
            setShowAddModal(false);
            setShowUpdateModal(false);
        }
    };

    const fetchBalanceData = async () => {
        setLoading(true);
        let params: Params = {
            owner: selectedOwner,
            year: selectedYear,
            month: selectedMonth,
        };
        const serverBalance = await fetchGetMonthlyBalance(params);
        console.log(serverBalance);

        if (serverBalance.length === 0) {
            setShowAddModal(true);
        } else {
            params = {
                owner: selectedOwner,
                year: selectedYear,
                month: selectedMonth - 1,
            };
            const calculated = await calculateBalance(params);
            console.log(calculated);
            setCalculatedBalance(calculated);

            const isDifferent =
                Math.abs(serverBalance.total_income - calculated.total_income) >
                    0.01 ||
                Math.abs(
                    serverBalance.total_expense - calculated.total_expense
                ) > 0.01 ||
                Math.abs(serverBalance.balance - calculated.balance) > 0.01;

            if (isDifferent) {
                setShowUpdateModal(true);
            } else {
                setBalanceData(serverBalance);
            }
        }
        setLoading(false);
        setItemsLoaded(true);
    };

    useEffect(() => {
        if (selectedOwner !== -1) fetchBalanceData();
    }, [selectedMonth, selectedYear, selectedOwner]);

    const handleModalClose = () => {
        setShowAddModal(false);
        setShowUpdateModal(false);
    };

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
                    {balanceData.total_income || balanceData.total_expense ? (
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

            {/* Add Balance Modal */}
            <Modal
                show={showAddModal}
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
                            handleReceipt(
                                {
                                    owner: selectedOwner,
                                    year: selectedYear,
                                    month: selectedMonth - 1,
                                },
                                calculatedBalance
                            )
                        }>
                        Dodaj
                    </button>
                </Modal.Footer>
            </Modal>

            {/* Update Balance Modal */}
            <Modal
                show={showUpdateModal}
                onHide={handleModalClose}
                backdrop="static"
                keyboard={false}>
                <Modal.Header closeButton>
                    <Modal.Title>Aktualizacja salda</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>
                        Pobrane dane różnią się od wyliczonego balansu. Czy
                        chcesz zaktualizować saldo?
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
                            handleReceipt(
                                {
                                    owner: selectedOwner,
                                    year: selectedYear,
                                    month: selectedMonth,
                                },
                                calculatedBalance
                            )
                        }>
                        Zaktualizuj
                    </button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default BalanceTab;

