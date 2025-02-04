import { Link } from "react-router-dom";
import UnifiedForm from "../components/UnifiedForm";
import {
    Breadcrumb,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const ExpensesPage = () => {
    return (
        <>
            {/* Breadcrumb nawigacja */}
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link to="/">Strona główna</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <span className="text-gray-500">Wydatki</span>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            {/* Nagłówek strony */}
            <h1 className="text-2xl font-bold mt-4">Wydatki</h1>
            <p className="text-gray-600">Dodaj swoje wydatki.</p>

            {/* Formularz dodawania wydatków */}
            <UnifiedForm
                formId="expense-form"
                buttonLabel="Zapisz paragon"
                showQuantity={true}
            />
        </>
    );
};

export default ExpensesPage;

