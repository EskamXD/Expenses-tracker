import { useState } from "react";
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
import { Receipt } from "@/types";

interface toastInterface {
    type: string;
    header: string;
    message: string;
}

const ImportExport = () => {
    const [toastArray, setToastArray] = useState<toastInterface[]>([]);

    // ** Pobieranie danych do eksportu **
    const { data: receipts, isFetching } = useQuery({
        queryKey: ["receipts"],
        queryFn: () => fetchGetReceipts(), // 🔹 Przekazanie domyślnych parametrów
        staleTime: 1000 * 60 * 5,
    });

    // ** Eksportowanie danych **
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
            setToastArray([
                ...toastArray,
                {
                    type: "success",
                    header: "Sukces",
                    message: "Dane zostały pomyślnie pobrane.",
                },
            ]);
        },
        onError: () => {
            setToastArray([
                ...toastArray,
                {
                    type: "danger",
                    header: "Błąd",
                    message: "Błąd podczas pobierania danych.",
                },
            ]);
        },
    });

    // ** Importowanie danych **
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
            await fetchPostReceipt(data);
            await fetchDatabaseScan();
            setToastArray([
                ...toastArray,
                {
                    type: "success",
                    header: "Sukces",
                    message: "Dane zostały pomyślnie zaimportowane.",
                },
            ]);
        },
        onError: () => {
            setToastArray([
                ...toastArray,
                {
                    type: "danger",
                    header: "Błąd",
                    message: "Błąd podczas importowania danych.",
                },
            ]);
        },
    });

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold">Import/Export</h1>

            {/* Tabsy */}
            <Tabs defaultValue="export" className="mt-4">
                <TabsList>
                    <TabsTrigger value="export">Eksport</TabsTrigger>
                    <TabsTrigger value="import">Import</TabsTrigger>
                </TabsList>

                {/* Eksport */}
                <TabsContent value="export">
                    <h2 className="text-xl font-semibold mt-4">Eksport</h2>
                    <Button
                        onClick={() => exportMutation.mutate()}
                        disabled={exportMutation.isPending || isFetching}>
                        {exportMutation.isPending
                            ? "Pobieranie..."
                            : "Eksportuj dane"}
                    </Button>
                    {(exportMutation.isPending || isFetching) && (
                        <Skeleton className="w-40 h-10 mt-2" />
                    )}
                </TabsContent>

                {/* Import */}
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

            {/* Toastery */}
            {/* <div className="fixed bottom-10 left-10 w-96 space-y-3">
                {toastArray.map((toast, index) => (
                    <Toaster
                        key={index}
                        type={toast.type}
                        header={toast.header}
                        message={toast.message}
                    />
                ))}
            </div> */}
        </div>
    );
};

export default ImportExport;
