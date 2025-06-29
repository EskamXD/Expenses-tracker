import { useMutation, useQueryClient } from "@tanstack/react-query";
import UnifiedForm from "@/components/unified-form";
import { fetchPostInvest, fetchPostReceipt } from "@/api/apiService";
import { Invest, Receipt } from "@/types";
import { toast } from "sonner";
import { useState } from "react";
import FormOperation from "@/components/form-operation";
import InvestForm from "@/components/invest-form";
import { IconLeft } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { useGlobalContext } from "@/context/GlobalContext";

const Expenses = () => {
    const { wallets, selectedWalletId, setSelectedWalletId } =
        useGlobalContext();

    const [formType, setFormType] = useState("");

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

    const postInvestMutation = useMutation({
        mutationFn: fetchPostInvest,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["investments"] });
            toast.success("Inwestycja zapisana");
        },
        onError: () => {
            toast.error("Błąd podczas zapisywania inwestycji");
        },
    });

    const handleSubmitReceipt = (newReceipt: Receipt) => {
        postReceiptMutation.mutate(newReceipt);
    };

    const handleSubmitInvest = (newInvestData: Invest) => {
        postInvestMutation.mutate(newInvestData);
    };

    return (
        <>
            <div className="flex items-center mt-4 gap-4">
                <Button
                    variant="outline"
                    disabled={formType === ""}
                    onClick={() => setFormType("")}>
                    <IconLeft className="w-4 h-4" />
                </Button>
                <h1 className="text-2xl font-bold">Zanotuj</h1>
            </div>
            <p className="text-muted-foreground">Dodaj swoje wydatki.</p>
            {formType === "" && <FormOperation setFormType={setFormType} />}
            {formType === "expense" && (
                <UnifiedForm
                    formId="expense-form"
                    transactionType="expense"
                    buttonLabel="Zapisz paragon"
                    showQuantity={true}
                    onSubmitReceipt={handleSubmitReceipt}
                />
            )}
            {formType === "income" && (
                <UnifiedForm
                    formId="income-form"
                    transactionType="income"
                    buttonLabel="Zapisz paragon"
                    showQuantity={false}
                    onSubmitReceipt={handleSubmitReceipt}
                />
            )}
            {formType === "investment" && (
                <InvestForm
                    onSubmitInvest={handleSubmitInvest}
                    wallets={wallets}
                    selectedWalletId={selectedWalletId}
                    setSelectedWalletId={setSelectedWalletId}
                />
            )}
        </>
    );
};

export default Expenses;

