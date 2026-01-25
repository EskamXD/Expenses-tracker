import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";

import {
    fetchExportReceiptsZip,
    fetchImportReceiptsFile,
} from "@/api/apiService";
import { Spinner } from "@/components/ui/spinner";

export const downloadBlob = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
};

const ImportExport = () => {
    const exportMutation = useMutation({
        mutationFn: async () => {
            const blob = await fetchExportReceiptsZip();
            const filename = `Kopia wydatków ${new Date().toISOString().slice(0, 10)}.zip`;

            downloadBlob(blob, filename);
        },
        onSuccess: () => toast(["Sukces", "Plik eksportu został pobrany."]),
        onError: () => toast(["Błąd", "Nie udało się pobrać eksportu."]),
    });

    const importMutation = useMutation({
        mutationFn: async (file: File) => {
            // backend przyjmuje .zip lub .ndjson
            return await fetchImportReceiptsFile(file);
        },
        onSuccess: (res) => {
            if (!res?.ok) {
                toast(["Błąd", "Import nie powiódł się."]);
                return;
            }

            // sukces całkowity
            if ((res.errors ?? 0) === 0) {
                toast(["Sukces", `Zaimportowano: ${res.inserted}`]);
                return;
            }

            // sukces częściowy / dużo błędów
            const first = res.errorSamples?.[0];
            const firstMsg = first
                ? `Pierwszy błąd (linia ${first.line}): ${first.error}`
                : "Brak szczegółów błędów.";

            toast([
                "Import zakończony z błędami",
                `Zaimportowano: ${res.inserted}, błędy: ${res.errors}. ${firstMsg}`,
            ]);

            // bonus: log pełnych próbek do debug
            console.group("Import errors (samples)");
            console.log(res.errorSamples);
            console.groupEnd();
        },
    });

    const isBusy = exportMutation.isPending || importMutation.isPending;

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
                        disabled={isBusy}
                        className="mt-4">
                        {exportMutation.isPending ? (
                            <span className="inline-flex items-center gap-2">
                                <Spinner />
                                Pobieranie...
                            </span>
                        ) : (
                            "Pobierz eksport (ZIP)"
                        )}
                    </Button>
                </TabsContent>

                <TabsContent value="import">
                    <h2 className="text-xl font-semibold mt-4">Import</h2>
                    <div className="flex flex-col gap-3">
                        <label className="text-gray-600">
                            Wybierz plik (.zip lub .ndjson):
                        </label>
                        <Input
                            type="file"
                            accept=".zip,.ndjson,application/zip,application/x-ndjson"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) importMutation.mutate(file);
                            }}
                            disabled={isBusy}
                        />
                        {importMutation.isPending && <Spinner />}
                    </div>
                </TabsContent>
            </Tabs>
        </>
    );
};

export default ImportExport;
