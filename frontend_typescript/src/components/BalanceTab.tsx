import { useEffect, useState } from "react";
import SummaryListGroup from "./SummaryListGroup";
import Spinner from "react-bootstrap/Spinner";
import { fetchMonthlyBalance } from "../services/apiService";
import { Params } from "../types";

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

    useEffect(() => {
        if (selectedOwner === -1) return;
        setLoading(true);

        const params = {
            owner: selectedOwner,
            year: selectedYear,
            month: selectedMonth,
        } as Params;

        fetchMonthlyBalance(params).then((response) => {
            setBalanceData(response.data);
            setItemsLoaded(true);
            setLoading(false);
        });
    }, [selectedMonth, selectedYear, selectedOwner]);

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
                <>
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
                </>
            )}
        </div>
    );
};

export default BalanceTab;
