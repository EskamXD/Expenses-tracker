import { useForm } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Wallet } from "@/types";
import { fetchPostWallets } from "@/api/apiService";

interface WalletFormFields {
    name: string;
    totalProfit?: number;
}

const WalletForm = () => {
    const queryClient = useQueryClient();

    const postWallets = useMutation({
        mutationFn: (newWallet: Wallet) => fetchPostWallets(newWallet),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["wallets"],
            });
            toast.success("Portfel został dodany");
        },
        onError: (err) => {
            toast.error(`Błąd podczas zapisywania portfela ${err}`);
        },
    });

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<WalletFormFields>({
        defaultValues: {
            name: "",
            totalProfit: undefined,
        },
    });

    const onSubmit = (data: WalletFormFields) => {
        postWallets.mutate({
            id: 0,
            name: data.name,
            total_profit: data.totalProfit,
            last_update: new Date().toISOString(),
        } as Wallet);
        reset();
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
                <Label htmlFor="name">Nazwa portfela</Label>
                <Input
                    type="text"
                    id="name"
                    {...register("name", { required: true })}
                    placeholder="np. Portfel Główny"
                />
                {errors.name && (
                    <span className="text-red-500 text-xs">
                        Wymagana nazwa portfela
                    </span>
                )}
            </div>
            <div className="flex flex-col gap-1">
                <Label htmlFor="totalProfit">Całościowy zysk (PLN)</Label>
                <Input
                    type="number"
                    step="0.01"
                    id="totalProfit"
                    {...register("totalProfit")}
                    placeholder="np. 1350"
                />
            </div>
            <Button type="submit" variant="default">
                Dodaj portfel
            </Button>
        </form>
    );
};

export default WalletForm;

