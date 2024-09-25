import { useState } from "react";
import { Tabs, Tab, Col } from "react-bootstrap";
import SummaryTab from "../components/SummaryTab";
import ChartTab from "../components/ChartTab";
import BalanceTab from "../components/BalanceTab";
import SummaryListGroup from "../components/SummaryListGroup"; // Ensure you import this component

const SummaryPage = () => {
    const [tab, setTab] = useState("expense");
    const [selectedOwner, setSelectedOwner] = useState<number>(-1);
    const [selectedYear, setSelectedYear] = useState<number>(
        new Date().getFullYear()
    );
    const [selectedMonth, setSelectedMonth] = useState<number>(
        new Date().getMonth() + 1
    );

    return (
        <Col className="pt-1rem" style={{ margin: "0", width: "100%" }}>
            <div className="mb-3">
                <SummaryListGroup
                    selectedOwner={selectedOwner}
                    setSelectedOwner={setSelectedOwner}
                    selectedYear={selectedYear}
                    setSelectedYear={setSelectedYear}
                    selectedMonth={selectedMonth}
                    setSelectedMonth={setSelectedMonth}
                    itemsLoaded={true}
                />
            </div>
            <Tabs
                activeKey={tab}
                id="summary-tabs"
                onSelect={(t) => t && setTab(t)}>
                <Tab eventKey="expense" title="Wydatki">
                    <SummaryTab
                        transactionType="expense"
                        selectedOwner={selectedOwner}
                        setSelectedOwner={setSelectedOwner}
                        selectedYear={selectedYear}
                        setSelectedYear={setSelectedYear}
                        selectedMonth={selectedMonth}
                        setSelectedMonth={setSelectedMonth}
                    />
                </Tab>
                <Tab eventKey="income" title="Przychody">
                    <SummaryTab
                        transactionType="income"
                        selectedOwner={selectedOwner}
                        selectedYear={selectedYear}
                        selectedMonth={selectedMonth}
                    />
                </Tab>
                <Tab eventKey="charts" title="Wykresy">
                    <ChartTab
                        tab={tab}
                        selectedOwner={selectedOwner}
                        selectedYear={selectedYear}
                        selectedMonth={selectedMonth}
                    />
                </Tab>
                <Tab eventKey="balance" title="Saldo">
                    <BalanceTab
                        selectedOwner={selectedOwner}
                        selectedYear={selectedYear}
                        selectedMonth={selectedMonth}
                    />
                </Tab>
            </Tabs>
        </Col>
    );
};

export default SummaryPage;
