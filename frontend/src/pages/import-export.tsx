import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import JSZip from "jszip";

import {
    fetchGetReceipts,
    fetchPostReceipt,
    fetchDatabaseScan,
} from "@/api/apiService";
import { toast } from "sonner";
import { Receipt } from "@/types";

// Funkcja dzieląca tablicę na mniejsze kawałki o zadanej wielkości
const chunkArray = <T,>(array: T[], chunkSize: number): T[][] => {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
};

const ImportExport = () => {
    const { data: receipts, isFetching } = useQuery({
        queryKey: ["receipts"],
        queryFn: () => fetchGetReceipts(),
        staleTime: 1000 * 60 * 5,
    });

    const exportMutation = useMutation({
        mutationFn: async () => {
            if (!receipts) throw new Error("Brak danych do eksportu");

            const zip = new JSZip();
            zip.file("data.json", JSON.stringify(receipts, null, 2));

            const content = await zip.generateAsync({ type: "blob" });
            const downloadLink = document.createElement("a");
            downloadLink.href = URL.createObjectURL(content);
            downloadLink.download = "data.zip";
            downloadLink.click();
        },
        onSuccess: () => {
            toast(["Sukces", "Dane zostały pomyślnie pobrane."]);
        },
        onError: () => {
            toast(["Błąd", "Nie udało się pobrać danych."]);
        },
    });

    const importMutation = useMutation({
        mutationFn: async (file: File) => {
            const fileReader = new FileReader();
            return new Promise<Receipt[]>((resolve, reject) => {
                fileReader.onload = (e) => {
                    if (!e.target || !e.target.result) {
                        reject("Nie można odczytać pliku");
                        return;
                    }
                    try {
                        const content = JSON.parse(String(e.target.result));
                        resolve(content);
                    } catch (error) {
                        reject("Niepoprawny format JSON");
                    }
                };
                fileReader.readAsText(file);
            });
        },
        onSuccess: async (data) => {
            // Dzielimy dane na partie po 50 paragonów
            const chunks = chunkArray<Receipt>(data, 50);
            for (const chunk of chunks) {
                await fetchPostReceipt(chunk);
            }
            await fetchDatabaseScan();
            toast(["Sukces", "Dane zostały pomyślnie zaimportowane."]);
        },
        onError: () => {
            toast(["Błąd", "Dane nie zostały zaimportowane."]);
        },
    });

    return (
        <>
            <h1 className="text-2xl font-bold mt-4">Import/Export</h1>

            <Tabs defaultValue="export" className="mt-4">
                <TabsList>
                    <TabsTrigger value="export">Eksport</TabsTrigger>
                    <TabsTrigger value="import">Import</TabsTrigger>
                </TabsList>

                <TabsContent value="export">
                    <h2 className="text-xl font-semibold mt-4">Eksport</h2>
                    <Button
                        onClick={() => exportMutation.mutate()}
                        disabled={exportMutation.isPending || isFetching}
                        className="mt-4">
                        {exportMutation.isPending
                            ? "Pobieranie..."
                            : "Eksportuj dane"}
                    </Button>
                    {(exportMutation.isPending || isFetching) && (
                        <Skeleton className="w-40 h-10 mt-2" />
                    )}
                </TabsContent>

                <TabsContent value="import">
                    <h2 className="text-xl font-semibold mt-4">Import</h2>
                    <div className="flex flex-col gap-3">
                        <label className="text-gray-600">Wybierz plik:</label>
                        <Input
                            type="file"
                            accept="application/json"
                            onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                    importMutation.mutate(e.target.files[0]);
                                }
                            }}
                            disabled={importMutation.isPending}
                        />
                        {importMutation.isPending && (
                            <Skeleton className="w-40 h-10" />
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </>
    );
};

export default ImportExport;
