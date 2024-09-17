// src/components/SummaryTab.jsx

import { useState, useEffect } from "react";
import { Col, Row } from "react-bootstrap";
import Spinner from "react-bootstrap/Spinner";
import SummaryTable from "./SummaryTable";
import SummaryListGroup from "./SummaryListGroup";

import { Receipt, Params } from "../types";
import "../assets/styles/main.css";
import { fetchGetReceipts } from "../services/apiService";

interface SummaryTabProps {
    transactionType: string;
}

const SummaryTab: React.FC<SummaryTabProps> = ({ transactionType }) => {
    const [receipts, setReceipts] = useState<Receipt[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(
        new Date().getMonth() + 1
    );
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedOwner, setSelectedOwner] = useState(-1);
    const [receiptsLoaded, setReceiptsLoaded] = useState(false);
    const [reload, setReload] = useState(false);

    const fetchFunction = async (params: Params) => {
        setLoading(true);
        await fetchGetReceipts(params)
            .then((response) => {
                setReceipts(response);
                setReceiptsLoaded(true);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    useEffect(() => {
        if (selectedOwner !== -1) {
            setReceiptsLoaded(false);
            const params = {
                transaction_type: transactionType,
                owner: selectedOwner,
                month: selectedMonth,
                year: selectedYear,
            } as Params;
            fetchFunction(params);
        }

        if (reload) setReload(false);
    }, [transactionType, selectedOwner, selectedMonth, selectedYear, reload]);

    return (
        <div className="center-div-top" id="main">
            <Col className="pt-1rem" style={{ margin: "0", width: "100%" }}>
                <SummaryListGroup
                    selectedOwner={selectedOwner}
                    setSelectedOwner={setSelectedOwner}
                    selectedYear={selectedYear}
                    setSelectedYear={setSelectedYear}
                    selectedMonth={selectedMonth}
                    setSelectedMonth={setSelectedMonth}
                    itemsLoaded={receiptsLoaded}
                />
                {loading ? (
                    <div className="center-div">
                        <Spinner animation="border" role="status">
                            <span className="sr-only"></span>
                        </Spinner>
                    </div>
                ) : (
                    <Row
                        className="pt-1rem"
                        style={{ margin: "0", width: "100%" }}>
                        {receiptsLoaded && (
                            <SummaryTable
                                receiptsLoaded={receiptsLoaded}
                                receipts={receipts}
                                transactionType={transactionType}
                                selectedOwner={selectedOwner}
                                reload={reload}
                                setReload={setReload}
                            />
                        )}
                    </Row>
                )}
            </Col>
        </div>
    );
};

export default SummaryTab;
