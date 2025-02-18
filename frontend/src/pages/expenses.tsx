import { useMutation, useQueryClient } from "@tanstack/react-query";
import UnifiedForm from "@/components/unified-form";
import { fetchPostReceipt } from "@/api/apiService";
import { Receipt } from "@/types";
import { toast } from "sonner";

const Expenses = () => {
    const queryClient = useQueryClient();

    const postReceiptMutation = useMutation({
        mutationFn: (newReceipt: Receipt) => fetchPostReceipt([newReceipt]),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["receipts"] });
            toast.success("Paragon zapisany pomyślnie");
        },
        onError: () => {
            toast.error("Błąd podczas zapisywania paragonu");
        },
    });

    const handleSubmitReceipt = (newReceipt: Receipt) => {
        postReceiptMutation.mutate(newReceipt);
    };

    return (
        <>
            <h1 className="text-2xl font-bold mt-4">Wydatki</h1>
            <p className="text-muted-foreground">Dodaj swoje wydatki.</p>

            <UnifiedForm
                formId="expense-form"
                transactionType="expense"
                buttonLabel="Zapisz paragon"
                showQuantity={true}
                onSubmitReceipt={handleSubmitReceipt}
            />
        </>
    );
};

export default Expenses;

