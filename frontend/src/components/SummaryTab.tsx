import { Col, Row } from "react-bootstrap";
import SummaryTable from "./SummaryTable";

import { useGlobalContext } from "../context/GlobalContext";
interface SummaryTabProps {
    transactionType: "income" | "expense";
}

const SummaryTab: React.FC<SummaryTabProps> = ({ transactionType }) => {
    const { filteredReceipts } = useGlobalContext();

    return (
        <div className="center-div-top" id="main">
            <Col className="pt-1rem" style={{ margin: "0", width: "100%" }}>
                <Row className="pt-1rem" style={{ margin: "0", width: "100%" }}>
                    {filteredReceipts.length > 0 ? (
                        <SummaryTable transactionType={transactionType} />
                    ) : (
                        <div className="center-div">
                            <p>Nie znaleziono żadnych paragonów.</p>
                        </div>
                    )}
                </Row>
            </Col>
        </div>
    );
};

export default SummaryTab;

