import { useEffect, useState } from "react";
import { Tabs, Tab, Col } from "react-bootstrap";
import SummaryTab from "../components/SummaryTab";
import ChartTab from "../components/ChartTab";
import BalanceTab from "../components/BalanceTab";
import SummaryFilters from "../components/SummaryFilters.tsx";

const SummaryPage = () => {
    const [tab, setTab] = useState("expense");

    return (
        <Col className="pt-1rem" style={{ margin: "0", width: "100%" }}>
            <div className="mb-3">
                <SummaryFilters />
            </div>
            <Tabs
                activeKey={tab}
                id="summary-tabs"
                onSelect={(t) => t && setTab(t)}>
                <Tab eventKey="expense" title="Wydatki">
                    <SummaryTab transactionType="expense" />
                </Tab>
                <Tab eventKey="income" title="Przychody">
                    <SummaryTab transactionType="income" />
                </Tab>
                {/* <Tab eventKey="charts" title="Wykresy">
                    <ChartTab
                        tab={tab}
                        selectedOwners={selectedOwner}
                        selectedYear={selectedYear}
                        selectedMonth={selectedMonth}
                    />
                </Tab>
                <Tab eventKey="balance" title="Saldo">
                    <BalanceTab
                        selectedOwners={selectedOwner}
                        selectedYear={selectedYear}
                        selectedMonth={selectedMonth}
                    />
                </Tab> */}
            </Tabs>
        </Col>
    );
};

export default SummaryPage;

