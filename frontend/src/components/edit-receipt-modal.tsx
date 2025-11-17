import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";
import UnifiedForm, { UnifiedFormRef } from "@/components/unified-form";
import { Params, Receipt } from "@/types";
import {
    fetchDeleteReceipt,
    fetchGetReceipts,
    fetchPutReceipt,
} from "@/api/apiService";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

/** Modal do edycji paragonu, wykorzystujący react-query do pobierania oraz mutacji danych */
interface EditReceiptModalProps {
    transactionType: "income" | "expense";
    receiptId: number;
    onClose: () => void;
}

export const EditReceiptModal: React.FC<EditReceiptModalProps> = ({
    transactionType,
    receiptId,
    onClose,
}) => {
    console.log(transactionType, receiptId);

    const queryClient = useQueryClient();
    const formRef = useRef<UnifiedFormRef>(null);

    // Pobierz szczegóły paragonu; zakładamy, że API zwraca tablicę – wybieramy pierwszy element
    const {
        data: receipt,
        isLoading,
        isError,
    } = useQuery<Receipt>({
        queryKey: ["receipt", receiptId],
        queryFn: async () => {
            const receipts = await fetchGetReceipts({
                id: receiptId,
            } as Params);
            return receipts[0] as Receipt;
        },
        enabled: receiptId !== undefined,
    });

    // Mutacja aktualizacji paragonu – używamy Sonner do wyświetlania powiadomień
    const updateMutation = useMutation({
        mutationFn: (updatedReceipt: Receipt) =>
            fetchPutReceipt(updatedReceipt.id, updatedReceipt),
        onSuccess: () => {
            toast.success("Paragon został pomyślnie zaktualizowany.");
            queryClient.invalidateQueries({ queryKey: ["receipts"] });
            onClose();
        },
        onError: () => {
            toast.error("Nie udało się zapisać paragonu.");
        },
    });

    // Mutacja usuwania paragonu – potwierdzamy operację za pomocą AlertDialog
    const deleteMutation = useMutation({
        mutationFn: (receiptToDelete: Receipt) =>
            fetchDeleteReceipt(receiptToDelete),
        onSuccess: () => {
            toast.success("Paragon został pomyślnie usunięty.");
            queryClient.invalidateQueries({ queryKey: ["receipts"] });
            onClose();
        },
        onError: () => {
            toast.error("Nie udało się usunąć paragonu.");
        },
    });

    if (isLoading)
        return (
            <Dialog open onOpenChange={onClose}>
                <DialogContent className="w-screen h-screen !max-w-none rounded-none">
                    <DialogHeader>
                        <DialogTitle>Edytuj paragon</DialogTitle>
                    </DialogHeader>
                    Ładowanie szczegółów paragonu...
                </DialogContent>
            </Dialog>
        );
    if (isError || !receipt)
        return (
            <Dialog open onOpenChange={onClose}>
                <DialogContent className="w-screen h-screen !max-w-none rounded-none">
                    <DialogHeader>
                        <DialogTitle>Błąd</DialogTitle>
                    </DialogHeader>
                    Błąd ładowania paragonu.
                </DialogContent>
            </Dialog>
        );

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="w-screen h-screen !max-w-none rounded-none overflow-y-auto pb-0">
                <DialogHeader>
                    <DialogTitle>Edytuj paragon</DialogTitle>
                </DialogHeader>
                <UnifiedForm
                    ref={formRef}
                    formId={`${transactionType}-form`}
                    transactionType={transactionType}
                    buttonLabel="Zapisz zmiany"
                    showQuantity={true}
                    receipt={receipt}
                    onSubmitReceipt={(updatedReceipt: Receipt) =>
                        updateMutation.mutate(updatedReceipt)
                    }
                    footerActions={
                        <>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive">
                                        Usuń paragon
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>
                                            Potwierdź usunięcie
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Czy na pewno chcesz usunąć ten
                                            paragon? Ta operacja jest
                                            nieodwracalna.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>
                                            Nie
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={() =>
                                                deleteMutation.mutate(receipt)
                                            }>
                                            Tak, usuń
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>

                            <Button variant="secondary" onClick={onClose}>
                                Anuluj
                            </Button>
                        </>
                    }
                />
            </DialogContent>
        </Dialog>
    );
};
