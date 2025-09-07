import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
    fetchGetInvestmentByWalletId,
    fetchGetInvestments,
    fetchGetWallets,
} from "@/api/apiService";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import WalletForm from "@/components/wallet-form";
import { Investment, Wallet } from "@/types";
import InvestmentCard from "@/components/invest-card";

const InvestmentPage = () => {
    const [selectedWalletId, setSelectedWalletId] = useState<number | null>(
        null
    );

    const { data: wallets = [] } = useQuery<Wallet[]>({
        queryKey: ["wallets"],
        queryFn: fetchGetWallets,
    });

    // Fetch inwestycje dla wybranego portfela (tylko gdy wybrany)
    const { data: groupedInvests = [], isLoading: investsLoading } = useQuery<
        Investment[]
    >({
        queryKey: ["groupedInvests", selectedWalletId],
        queryFn: async () => {
            if (selectedWalletId === null) return [];
            return await fetchGetInvestmentByWalletId(selectedWalletId);
        },
        enabled: selectedWalletId !== null,
    });

    // const { data: instruments = [], isLoading: instrumentsLoading } = useQuery<
    //     Instrument[]
    // >({
    //     queryKey: ["instruments"],
    //     queryFn: async () => await fetchGetInstruments(),
    // });

    return (
        <div className="flex flex-col gap-8">
            <div className="flex justify-between items-center w-full gap-4">
                <div>
                    <h1 className="text-2xl font-bold mt-4">Inwestycje</h1>
                    <p className="text-muted-foreground">
                        Tu możesz prowadzić swój portfel inwestycyjny.
                    </p>
                </div>
                <Select
                    value={selectedWalletId ? String(selectedWalletId) : ""}
                    onValueChange={(v) => setSelectedWalletId(Number(v))}
                    disabled={wallets.length === 0}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Portfel" />
                    </SelectTrigger>
                    <SelectContent>
                        {wallets.map((w) => (
                            <SelectItem key={w.id} value={String(w.id)}>
                                {w.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <WalletFormDialog />
            </div>

            {/* Tabela inwestycji */}
            <div>
                {selectedWalletId === null && (
                    <p>Wybierz portfel, aby zobaczyć inwestycje.</p>
                )}
                {selectedWalletId !== null && (
                    <>
                        <div className="flex justify-between items-center mb-2">
                            <h2 className="text-xl font-semibold">
                                Inwestycje w portfelu
                            </h2>
                            {/* <InvestFormDialog walletId={selectedWalletId} />  // Przycisk dodawania inwestycji */}
                        </div>
                        {investsLoading ? (
                            <div>Ładowanie inwestycji...</div>
                        ) : groupedInvests.length === 0 ? (
                            <div>Brak inwestycji w tym portfelu.</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {groupedInvests.map((group: Investment) => (
                                    <InvestmentCard
                                        key={group.id}
                                        group={group}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export const WalletFormDialog = () => (
    <Dialog>
        <DialogTrigger asChild>
            <Button>+ Dodaj Portfel</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>Dodaj nowy portfel</DialogTitle>
            </DialogHeader>
            <WalletForm />
        </DialogContent>
    </Dialog>
);

export default InvestmentPage;

