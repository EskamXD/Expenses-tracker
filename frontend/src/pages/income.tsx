import { useMutation, useQueryClient } from "@tanstack/react-query";
import UnifiedForm from "@/components/unified-form";
import { fetchPostReceipt } from "@/api/apiService";
import { Receipt } from "@/types";
import { toast } from "sonner";

const Income = () => {
    const queryClient = useQueryClient();

    const postReceiptMutation = useMutation({
        mutationFn: (newReceipt: Receipt) => fetchPostReceipt([newReceipt]),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["receipts"] });
            toast.success("Paragon zapisany!");
        },
        onError: () => {
            toast.error("Błąd podczas zapisywania paragonu");
        },
    });

    const handleSubmitReceipt = (newReceipt: Receipt) => {
        console.log(newReceipt);
        postReceiptMutation.mutate(newReceipt);
    };

    return (
        <>
            <h1 className="text-2xl font-bold mt-4">Przychody</h1>
            <p className="text-muted-foreground">Dodaj swoje przychody.</p>

            <UnifiedForm
                formId="income-form"
                transactionType="income"
                buttonLabel="Zapisz paragon"
                showQuantity={false}
                onSubmitReceipt={handleSubmitReceipt}
            />
        </>
    );
};

export default Income;
