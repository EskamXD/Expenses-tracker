import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import UnifiedForm from "../components/UnifiedForm";

const IncomePage = () => {
    return (
        <>
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/">Home</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Przychody</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
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

