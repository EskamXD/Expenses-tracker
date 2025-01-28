import Breadcrumb from "react-bootstrap/Breadcrumb";
import { Link } from "react-router-dom";
import UnifiedForm from "../components/UnifiedForm";

const ExpensesPage = () => {
    return (
        <>
            <Breadcrumb>
                <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>
                    Strona główna
                </Breadcrumb.Item>
                <Breadcrumb.Item active>Wydatki</Breadcrumb.Item>
            </Breadcrumb>

            <h1>Wydatki</h1>
            <p>Dodaj swoje wydatki.</p>

            <UnifiedForm
                formId="expense-form"
                buttonLabel="Zapisz paragon"
                showQuantity={true}
            />
        </>
    );
};

export default ExpensesPage;

