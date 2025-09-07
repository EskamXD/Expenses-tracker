import { useForm } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { fetchPostInstrument } from "@/api/apiService"; // Dodaj tę funkcję do apiService

interface InstrumentFormFields {
    name: string;
    symbol: string;
    category: string;
    market?: string;
    currency?: string;
    description?: string;
    current_price?: number;
}

const CATEGORY_OPTIONS = [
    { value: "stock", label: "Akcje" },
    { value: "etf", label: "ETF" },
    { value: "bond", label: "Obligacje" },
    { value: "crypto", label: "Kryptowaluty" },
    { value: "commodity", label: "Surowce" },
    { value: "fund", label: "Fundusze" },
    { value: "deposit", label: "Lokata" },
    { value: "other", label: "Inne" },
];

const InstrumentForm = () => {
    const queryClient = useQueryClient();

    const postInstrument = useMutation({
        mutationFn: (newInstrument: InstrumentFormFields) =>
            fetchPostInstrument(newInstrument),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["instruments"] });
            toast.success("Instrument został dodany");
        },
        onError: (err) => {
            toast.error(`Błąd podczas zapisywania instrumentu ${err}`);
        },
    });

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<InstrumentFormFields>({
        defaultValues: {
            name: "",
            symbol: "",
            category: "",
            market: "",
            currency: "PLN",
            description: "",
            current_price: undefined,
        },
    });

    const onSubmit = (data: InstrumentFormFields) => {
        postInstrument.mutate(data);
        reset();
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div>
                <Label htmlFor="name">Nazwa instrumentu</Label>
                <Input
                    id="name"
                    {...register("name", { required: true })}
                    placeholder="np. Apple Inc."
                />
                {errors.name && (
                    <span className="text-red-500 text-xs">Wymagana nazwa</span>
                )}
            </div>
            <div>
                <Label htmlFor="symbol">Symbol</Label>
                <Input
                    id="symbol"
                    {...register("symbol", { required: true })}
                    placeholder="np. AAPL"
                />
                {errors.symbol && (
                    <span className="text-red-500 text-xs">
                        Wymagany symbol
                    </span>
                )}
            </div>
            <div>
                <Label htmlFor="category">Kategoria</Label>
                <Select
                    onValueChange={(val) => {
                        /* ręczna obsługa setValue jeśli potrzebujesz */
                    }}
                    defaultValue="">
                    <SelectTrigger id="category">
                        <SelectValue placeholder="Wybierz kategorię" />
                    </SelectTrigger>
                    <SelectContent>
                        {CATEGORY_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div>
                <Label htmlFor="market">Rynek/Giełda</Label>
                <Input
                    id="market"
                    {...register("market")}
                    placeholder="np. NASDAQ"
                />
            </div>
            <div>
                <Label htmlFor="currency">Waluta</Label>
                <Input
                    id="currency"
                    {...register("currency")}
                    placeholder="np. PLN"
                />
            </div>
            <div>
                <Label htmlFor="description">Opis</Label>
                <Input
                    id="description"
                    {...register("description")}
                    placeholder="np. Największa firma technologiczna"
                />
            </div>
            <div>
                <Label htmlFor="current_price">Aktualna cena</Label>
                <Input
                    type="number"
                    step="0.01"
                    id="current_price"
                    {...register("current_price")}
                    placeholder="np. 189.50"
                />
            </div>
            <Button type="submit" variant="default">
                Dodaj instrument
            </Button>
        </form>
    );
};

export default InstrumentForm;

