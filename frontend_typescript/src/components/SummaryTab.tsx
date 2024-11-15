import { useState, useEffect } from "react";
import { Col, Row } from "react-bootstrap";
import Spinner from "react-bootstrap/Spinner";
import SummaryTable from "./SummaryTable";
// import SummaryListGroup from "./SummaryListGroup";
import { Receipt, Params } from "../types";
import { fetchGetReceipts } from "../services/apiService";

interface SummaryTabProps {
    transactionType: string;
    selectedOwner: number;
    selectedYear: number;
    selectedMonth: number;
}

const SummaryTab: React.FC<SummaryTabProps> = ({
    transactionType,
    selectedOwner,
    selectedYear,
    selectedMonth,
}) => {
    const [receipts, setReceipts] = useState<Receipt[]>([]);
    const [loading, setLoading] = useState(false);
    const [receiptsLoaded, setReceiptsLoaded] = useState(false);
    const [reload, setReload] = useState(false);

    useEffect(() => {
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

        if (selectedOwner !== -1) {
            setReceiptsLoaded(false);
            const params: Params = {
                transaction_type: transactionType,
                owner: selectedOwner !== 100 ? selectedOwner : undefined,
                month: selectedMonth,
                year: selectedYear,
            };
            fetchFunction(params);
        }

        if (reload) setReload(false);
    }, [transactionType, selectedOwner, selectedMonth, selectedYear, reload]);

    return (
        <div className="center-div-top" id="main">
            <Col className="pt-1rem" style={{ margin: "0", width: "100%" }}>
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
