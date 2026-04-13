import { useMemo, useState } from "react";

type ParsedItem = {
    description: string;
    value: string;
    quantity: number;
    category: string;
    owners?: number[];
};

type ParsedReceiptResponse = {
    shop: string;
    payment_date: string | null;
    items: ParsedItem[];
    raw_text: string;
    warning?: string | null;
};

const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000/api";

export default function ReceiptDebugPage() {
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [parsedReceipt, setParsedReceipt] =
        useState<ParsedReceiptResponse | null>(null);

    const [createLoading, setCreateLoading] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);
    const [createResponse, setCreateResponse] = useState<unknown>(null);

    const canCreateReceipt = useMemo(() => {
        return (
            !!parsedReceipt?.shop &&
            !!parsedReceipt?.payment_date &&
            !!parsedReceipt?.items?.length
        );
    }, [parsedReceipt]);

    if (!import.meta.env.DEV) {
        return (
            <div style={{ padding: 24 }}>
                <h1>404</h1>
                <p>Ta strona jest dostępna tylko w trybie developerskim.</p>
            </div>
        );
    }

    const handleUpload = async () => {
        if (!pdfFile) {
            setUploadError("Wybierz plik PDF.");
            return;
        }

        setUploadLoading(true);
        setUploadError(null);
        setParsedReceipt(null);

        try {
            const formData = new FormData();
            formData.append("file", pdfFile);

            const response = await fetch(`${API_URL}/receipts/pdf-upload/`, {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.detail || "Nie udało się przetworzyć PDF.",
                );
            }

            setParsedReceipt(data);
        } catch (error) {
            setUploadError(
                error instanceof Error
                    ? error.message
                    : "Nieznany błąd uploadu.",
            );
        } finally {
            setUploadLoading(false);
        }
    };

    const handleCreateReceipt = async () => {
        if (!parsedReceipt) return;

        setCreateLoading(true);
        setCreateError(null);
        setCreateResponse(null);

        try {
            const payload = {
                payment_date: parsedReceipt.payment_date,
                payer: 1,
                shop: parsedReceipt.shop || "DEBUG_SHOP",
                transaction_type: "BLIK",
                items: parsedReceipt.items.map((item) => ({
                    description: item.description,
                    value: item.value,
                    quantity: item.quantity ?? 1,
                    category: item.category ?? "food_drinks",
                })),
            };

            const response = await fetch(`${API_URL}/receipts/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.detail ||
                        data?.errors?.items ||
                        "Nie udało się zapisać paragonu.",
                );
            }

            setCreateResponse(data);
        } catch (error) {
            setCreateError(
                error instanceof Error
                    ? error.message
                    : "Nieznany błąd zapisu.",
            );
        } finally {
            setCreateLoading(false);
        }
    };

    return (
        <div
            style={{
                maxWidth: 1200,
                margin: "0 auto",
                padding: 24,
                fontFamily: "Inter, system-ui, sans-serif",
            }}>
            <h1>Receipt Debug</h1>
            <p>Strona testowa tylko dla środowiska dev.</p>

            <div
                style={{
                    display: "grid",
                    gap: 24,
                    gridTemplateColumns: "1fr 1fr",
                    alignItems: "start",
                }}>
                <section
                    style={{
                        border: "1px solid #ddd",
                        borderRadius: 12,
                        padding: 16,
                    }}>
                    <h2>1. Upload PDF</h2>

                    <label style={{ display: "block", marginBottom: 12 }}>
                        <input
                            type="file"
                            accept="application/pdf,.pdf"
                            onChange={(e) =>
                                setPdfFile(e.target.files?.[0] ?? null)
                            }
                        />
                    </label>

                    <button
                        onClick={handleUpload}
                        disabled={uploadLoading || !pdfFile}>
                        {uploadLoading ? "Wysyłanie..." : "Wyślij PDF"}
                    </button>

                    {uploadError && (
                        <pre
                            style={{
                                marginTop: 16,
                                color: "#a40000",
                                padding: 12,
                                borderRadius: 8,
                                whiteSpace: "pre-wrap",
                            }}>
                            {uploadError}
                        </pre>
                    )}

                    {parsedReceipt && (
                        <pre
                            style={{
                                marginTop: 16,
                                padding: 12,
                                borderRadius: 8,
                                overflowX: "auto",
                            }}>
                            {JSON.stringify(parsedReceipt, null, 2)}
                        </pre>
                    )}
                </section>

                <section
                    style={{
                        border: "1px solid #ddd",
                        borderRadius: 12,
                        padding: 16,
                    }}>
                    <h2>2. Zapis do backendu</h2>

                    <button
                        onClick={handleCreateReceipt}
                        disabled={!canCreateReceipt || createLoading}>
                        {createLoading ? "Zapisywanie..." : "Utwórz Receipt"}
                    </button>

                    {!canCreateReceipt && (
                        <p style={{ marginTop: 12, color: "#666" }}>
                            Najpierw wyślij PDF i poczekaj na poprawny parse.
                        </p>
                    )}

                    {createError && (
                        <pre
                            style={{
                                marginTop: 16,
                                color: "#a40000",
                                padding: 12,
                                borderRadius: 8,
                                whiteSpace: "pre-wrap",
                            }}>
                            {createError}
                        </pre>
                    )}

                    {createResponse && (
                        <pre
                            style={{
                                marginTop: 16,
                                padding: 12,
                                borderRadius: 8,
                                overflowX: "auto",
                            }}>
                            {JSON.stringify(createResponse, null, 2)}
                        </pre>
                    )}
                </section>
            </div>
        </div>
    );
}

