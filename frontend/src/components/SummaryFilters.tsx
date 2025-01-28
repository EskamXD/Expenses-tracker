import Button from "react-bootstrap/Button";
import ListGroup from "react-bootstrap/ListGroup";
import YearDropdown from "./YearDropdown";
import MonthDropdown from "./MonthDropdown";
import SummaryDropdown from "./SummaryDropdown";
import { ListGroupItem } from "react-bootstrap";
import { useGlobalContext } from "../context/GlobalContext";

const SummaryListGroup = () => {
    const { filterReceipts } = useGlobalContext();

    return (
        <ListGroup horizontal={true}>
            <ListGroup.Item>
                <SummaryDropdown />
            </ListGroup.Item>
            <ListGroup.Item>
                <YearDropdown />
            </ListGroup.Item>
            <ListGroup.Item>
                <MonthDropdown />
            </ListGroup.Item>
            <ListGroup.Item>
                <Button onClick={() => filterReceipts()}>Filtruj</Button>
            </ListGroup.Item>
        </ListGroup>
    );
};

export default SummaryListGroup;

