import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
    fetchGetReceipts,
    fetchLineSums,
    fetchPostReceipt,
    fetchPutReceipt,
} from "../api/apiService";
import { Item, Params, Receipt } from "../types";
import Dialog from "@/components/ui/dialog";
import { colors } from "../config/colors";
import moment from "moment";

interface lineSumsInterface {
    linearExpenseSums: number[];
    linearIncomeSums: number[];
}

interface BalanceDataInterface {
    total_income: number;
    total_expense: number;
    balance: number;
}

interface BalanceTabProps {
    selectedOwner: number;
    selectedYear: number;
    selectedMonth: number;
}

const BalanceTab: React.FC<BalanceTabProps> = ({
    selectedOwner,
    selectedYear,
    selectedMonth,
}) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [itemsLoaded, setItemsLoaded] = useState<boolean>(false);
    const [showAddModal, setShowAddModal] = useState<boolean>(false);
    const [showUpdateModal, setShowUpdateModal] = useState<boolean>(false);
    const [currentBalanceData, setCurrentBalanceData] =
        useState<BalanceDataInterface>({
            total_income: NaN,
            total_expense: NaN,
            balance: NaN,
        });
    const [lastMonthBalanceData, setLastMonthBalanceData] =
        useState<number>(NaN);
    const [lastMonthServerBalanceData, setLastMonthServerBalanceData] =
        useState<number>(NaN);
    const [receiptsID, setReceiptsID] = useState<{
        [key: string]: number;
        [key: number]: number;
    }>({
        receiptID: 0,
        itemID: 0,
    });
    const [investmentDictionary, setInvestmentDictionary] = useState<{
        [key: string]: number;
    }>({}); // shop: sum

    const calculateBalance = (response: lineSumsInterface) => {
        // Check if response and its properties are defined
        const incomeSums = response.linearIncomeSums || [0];
        const expenseSums = response.linearExpenseSums || [0];

        // Get the last elements safely
        const income = Number(incomeSums.slice(-1)[0]) || 0;
        const expense = Number(expenseSums.slice(-1)[0]) || 0;

        return Math.round((income - expense) * 1e2) / 1e2;
    };

    useEffect(() => {
        // if (lastMonthBalanceData !== lastMonthServerBalanceData) {
        //     setShowUpdateModal(true);
        // } else if (isNaN(lastMonthBalanceData)) {
        //     setShowAddModal(true);
        // }
    }, [lastMonthBalanceData]);

    useEffect(() => {
        // console.clear();
        setLoading(true);

        async function fetchingBalance() {
            // Get current month data to display
            const params: Params = {
                owner: selectedOwner,
                year: selectedYear,
                month: selectedMonth,
                category: "last_month_balance",
            };

            let response = await fetchLineSums(params);
            setCurrentBalanceData({
                total_income:
                    Math.round(
                        Number(response.linearIncomeSums.slice(-1)[0]) * 1e2
                    ) / 1e2,
                total_expense:
                    Math.round(
                        Number(response.linearExpenseSums.slice(-1)[0]) * 1e2
                    ) / 1e2,
                balance: calculateBalance(response),
            });

            // Check if balance from last month exists
            response = await fetchGetReceipts(params);
            if (response.length > 0) {
                setReceiptsID({
                    receiptID: Number(response[0].id),
                    itemID: Number(response[0].items[0].id),
                });

                setLastMonthServerBalanceData(
                    Number(response[0].items[0].value)
                );
                // const lastMonthBalanceFromReceipt = Number(
                //     response[0].items[0].value
                // );
                // Check if balance from last month is the same as calculated
                const lastMonthParams: Params = {
                    owner: selectedOwner,
                    year: selectedYear,
                    month: selectedMonth - 1,
                };
                response = fetchLineSums(lastMonthParams);
                const lastMonthBalanceFromLineSums = calculateBalance(response);

                setLastMonthBalanceData(lastMonthBalanceFromLineSums);
            } else {
                // Calculate balance from last month
                const lastMonthParams: Params = {
                    owner: selectedOwner,
                    year: selectedYear,
                    month: selectedMonth - 1,
                };
                response = fetchLineSums(lastMonthParams);
                const lastMonthBalance = calculateBalance(response);
                setLastMonthBalanceData(lastMonthBalance);
            }
        }

        async function fetchingMoneyAssets() {
            const params: Params = {
                owner: selectedOwner,
                year: selectedYear,
                month: selectedMonth,
                category: ["investments_savings", "investments_income"],
            };

            await fetchGetReceipts(params).then((response) => {
                console.log("response", response);
                // Create a object with shop names as keys and values as a sums of money
                var dict = new Object() as { [key: string]: number };

                response.forEach((receipt: Receipt) => {
                    receipt.items.forEach((item: Item) => {
                        if (!dict[receipt.shop]) {
                            dict[receipt.shop] = 0;
                        }
                        if (item.category === "investments_savings") {
                            dict[receipt.shop] += Number(item.value);
                        } else if (item.category === "investments_income") {
                            dict[receipt.shop] -= Number(item.value);
                        }
                    });
                });

                console.log("dict", dict);
                setInvestmentDictionary(dict);
                const sum = Object.values(dict).reduce((a, b) => a + b, 0);
                console.log(
                    "Twój stan konta: ",
                    currentBalanceData.total_income,
                    sum,
                    currentBalanceData.total_income - sum
                );
            });
        }

        if (selectedOwner !== -1) {
            fetchingBalance();
            fetchingMoneyAssets();
        }

        setLoading(false);
        setItemsLoaded(true);
    }, [selectedOwner, selectedYear, selectedMonth]);

    useEffect(() => {
        if (
            currentBalanceData &&
            lastMonthBalanceData &&
            lastMonthServerBalanceData
        ) {
            setItemsLoaded(true);
        }
    }, [currentBalanceData, lastMonthBalanceData, lastMonthServerBalanceData]);

    const handleReceipt = async (params: Params, balance: number) => {
        setLoading(true);
        if (params.owner && params.year && params.month) {
            const receipt = [
                {
                    id: receiptsID.receiptID,
                    payment_date: moment(
                        new Date(params.year, params.month - 1, 1)
                    ).format("YYYY-MM-DD"),
                    payer: params.owner,
                    shop: "",
                    transaction_type: "income",
                    items: [
                        {
                            id: receiptsID.itemID,
                            category: "last_month_balance",
                            value: balance,
                            description: "Saldo z poprzedniego miesiąca",
                            quantity: 1,
                            owner: params.owner,
                        },
                    ] as Item[],
                },
            ] as Receipt[];
            // console.log("receipt", receipt);
            if (showAddModal) {
                // console.log("dodaje");
                await fetchPostReceipt(receipt);
            } else if (showUpdateModal) {
                // console.log("aktualizuje");
                await fetchPutReceipt(receiptsID.receiptID, receipt[0]);
            }
        }

        setLoading(false);
        setShowAddModal(false);
        setShowUpdateModal(false);
    };

    const handleModalClose = () => {
        setShowAddModal(false);
        setShowUpdateModal(false);
    };

    return (
        <div className="center-div-top">
            <Col className="pt-1rem" style={{ margin: "0", width: "100%" }}>
                <div className="center-div-top d-flex flex-column">
                    {loading &&
                    !!itemsLoaded &&
                    !!showAddModal &&
                    !!showUpdateModal ? (
                        <Skeleton animation="border" role="status">
                            <span className="sr-only"></span>
                        </Skeleton>
                    ) : currentBalanceData ? (
                        <div className="mt-1rem">
                            {currentBalanceData.total_income ||
                            currentBalanceData.total_expense ? (
                                <>
                                    <h3>Podsumowanie miesiąca</h3>
                                    <p>
                                        <strong>Przychody:</strong>{" "}
                                        {currentBalanceData.total_income} zł
                                    </p>
                                    <p>
                                        <strong>Wydatki:</strong>{" "}
                                        {currentBalanceData.total_expense} zł
                                    </p>
                                    <p>
                                        <strong>Saldo:</strong>{" "}
                                        {currentBalanceData.balance} zł
                                    </p>
                                    <hr></hr>
                                    <h3>
                                        Podsumowanie wpłat inwestycji w tym
                                        miesiącu
                                    </h3>
                                    {investmentDictionary &&
                                        Object.keys(investmentDictionary).map(
                                            (key) =>
                                                key !== "" && (
                                                    <p key={key}>
                                                        <strong>{key}:</strong>{" "}
                                                        {
                                                            investmentDictionary[
                                                                key
                                                            ]
                                                        }{" "}
                                                        zł
                                                    </p>
                                                )
                                        )}
                                    <hr></hr>
                                    <h3>
                                        Ilość wypłaconych środków z inwestycji
                                    </h3>
                                    {Object.keys(investmentDictionary).map(
                                        (key) =>
                                            key === "" && (
                                                <p key={key}>
                                                    {investmentDictionary[key]}{" "}
                                                    zł
                                                </p>
                                            )
                                    )}
                                </>
                            ) : (
                                <h3>Brak danych do wyświetlenia</h3>
                            )}
                        </div>
                    ) : (
                        <h3>Brak danych do wyświetlenia</h3>
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
                                Nie znaleziono miesięcznego balansu. Czy chcesz
                                dodać go do tego miesiąca?
                            </p>
                            <p>{lastMonthBalanceData} zł</p>
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
                                        lastMonthBalanceData
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
                                Pobrane dane różnią się od wyliczonego balansu.
                                Czy chcesz zaktualizować saldo?
                            </p>
                            <p>
                                Stare saldo:{" "}
                                <span style={{ color: colors["red"] }}>
                                    {lastMonthServerBalanceData} zł
                                </span>
                                {" > Nowe saldo: "}
                                <span style={{ color: colors["limeGreen"] }}>
                                    {lastMonthBalanceData} zł
                                </span>
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
                                        lastMonthBalanceData
                                    )
                                }>
                                Zaktualizuj
                            </button>
                        </Modal.Footer>
                    </Modal>
                </div>
            </Col>
        </div>
    );
};

export default BalanceTab;

