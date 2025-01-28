import Breadcrumb from "react-bootstrap/Breadcrumb";
import { Link } from "react-router-dom";
import UnifiedForm from "../components/UnifiedForm";

const IncomePage = () => {
    return (
        <>
            <Breadcrumb>
                <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>
                    Strona główna
                </Breadcrumb.Item>
                <Breadcrumb.Item active>Przychody</Breadcrumb.Item>
            </Breadcrumb>

            <h1>Przychody</h1>
            <p>Dodaj swoje przychody</p>

            <UnifiedForm
                formId="income-form"
                buttonLabel="Zapisz paragon"
                showQuantity={true}
            />
        </>
    );
};

export default IncomePage;

