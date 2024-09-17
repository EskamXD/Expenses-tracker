import { useEffect, useState } from "react";
import { Button, Form, Tab, Tabs } from "react-bootstrap";
import Spinner from "react-bootstrap/Spinner";
import JSZip from "jszip";

import { fetchGetReceipts, fetchPostReceipt } from "../services/apiService";

import Toaster from "../components/Toaster";

import "../assets/styles/main.css";
import { Receipt } from "../types";

interface showToastInterface {
    successDownload: boolean;
    failedDownload: boolean;
    successUpload: boolean;
    failedUpload: boolean;
}

interface toastInterface {
    type: string;
    header: string;
    message: string;
}

const ImportExportPage = () => {
    // const currentMonth = new Date().getMonth() - 8;
    // const currentYear = new Date().getFullYear();

    // const [fromMonth, setFromMonth] = useState(
    //     currentMonth === 0 ? 12 : currentMonth - 1
    // );
    // const [fromYear, setFromYear] = useState(
    //     currentMonth === 0 ? currentYear - 1 : currentYear
    // );

    // const [toMonth, setToMonth] = useState(currentMonth);
    // const [toYear, setToYear] = useState(currentYear);

    const [isDownloading, setIsDownloading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [showToast, setShowToast] = useState<showToastInterface>({
        successDownload: false,
        failedDownload: false,
        successUpload: false,
        failedUpload: false,
    });

    const [toastArray, setToastArray] = useState<toastInterface[]>([]);

    useEffect(() => {
        const newToastArray = [];

        if (showToast.successDownload) {
            newToastArray.push({
                type: "success",
                header: "Sukces",
                message: "Dane zostały pomyślnie pobrane.",
            });

            setTimeout(() => {
                setShowToast((prevState) => ({
                    ...prevState,
                    successDownload: false,
                }));
            }, 5500);
        }
        if (showToast.failedDownload) {
            newToastArray.push({
                type: "danger",
                header: "Błąd",
                message: "Błąd podczas pobierania danych.",
            });
            setTimeout(() => {
                setShowToast((prevState) => ({
                    ...prevState,
                    failedDownload: false,
                }));
            }, 5500);
        }
        if (showToast.successUpload) {
            newToastArray.push({
                type: "success",
                header: "Sukces",
                message: "Dane zostały pomyślnie zaimportowane.",
            });
            setTimeout(() => {
                setShowToast((prevState) => ({
                    ...prevState,
                    successUpload: false,
                }));
            }, 5500);
        }
        if (showToast.failedUpload) {
            newToastArray.push({
                type: "danger",
                header: "Błąd",
                message: "Błąd podczas importowania danych.",
            });
            setTimeout(() => {
                setShowToast((prevState) => ({
                    ...prevState,
                    failedUpload: false,
                }));
            }, 5500);
        }

        setToastArray(newToastArray); // Ustawiamy nową tablicę
    }, [showToast]);

    const downloadJsonAsZip = async () => {
        setIsDownloading(true);

        fetchGetReceipts()
            .then((response) => {
                const zip = new JSZip();
                zip.file("data.json", JSON.stringify(response.data, null, 2));

                zip.generateAsync({ type: "blob" }).then((content) => {
                    const downloadLink = document.createElement("a");
                    downloadLink.href = URL.createObjectURL(content);
                    downloadLink.download = "data.zip";
                    downloadLink.click();
                    setIsDownloading(false);
                    setShowToast((prevState) => ({
                        ...prevState,
                        successDownload: true,
                    }));
                });
            })
            .catch(() => {
                setShowToast((prevState) => ({
                    ...prevState,
                    failedDownload: true,
                }));
            })
            .finally(() => {
                setIsDownloading(false);
            });
    };

    const handleFileUpload = (e: any) => {
        setIsUploading(true);
        e.preventDefault();

        const fileReader = new FileReader();
        fileReader.onload = async (e) => {
            if (!e.target || !e.target.result) {
                setShowToast((prevState) => ({
                    ...prevState,
                    failedUpload: true,
                }));
                setIsUploading(false);
                return;
            }
            const content = e.target.result;
            const json = JSON.parse(String(content));

            const receipts: Receipt[] = json;

            if (receipts.length === 0) {
                setShowToast((prevState) => ({
                    ...prevState,
                    failedUpload: true,
                }));
                setIsUploading(false);
                return;
            }

            fetchPostReceipt(receipts)
                .then(() => {
                    setShowToast((prevState) => ({
                        ...prevState,
                        successUpload: true,
                    }));
                })
                .catch(() => {
                    setShowToast((prevState) => ({
                        ...prevState,
                        failedUpload: true,
                    }));
                })
                .finally(() => {
                    setIsUploading(false);
                });
        };
    };

    return (
        <>
            <h1>Import/Export</h1>
            <Tabs defaultActiveKey="export" id="import-export-tabs">
                <Tab eventKey="export" title="Eksport">
                    <h2>Eksport</h2>
                    <Button
                        variant="primary"
                        onClick={downloadJsonAsZip}
                        disabled={isDownloading}>
                        {isDownloading ? "Pobieranie..." : "Eksportuj dane"}
                    </Button>
                </Tab>
                <Tab eventKey="import" title="Import">
                    <h2>Import</h2>
                    <Form.Group controlId="formFileMultiple" className="mb-3">
                        <Form.Label>Wybierz pliki...</Form.Label>
                        <Form.Control
                            type="file"
                            multiple={false} // Removed multiple to keep logic simple for now
                            accept="application/json"
                            onChange={(event) => handleFileUpload(event)} // Use onChange event
                        />
                    </Form.Group>
                    {showToast.successDownload && (
                        <Spinner animation="border" role="status">
                            <span className="visually-hidden">
                                Ładowanie...
                            </span>
                        </Spinner>
                    )}
                </Tab>
            </Tabs>
            <div
                className="d-flex flex-column gap-3 position-absolute"
                style={{ bottom: "140px", left: "30px", width: "500px" }}>
                {toastArray.map((toast, index) => (
                    <Toaster
                        key={index}
                        type={toast.type}
                        header={toast.header}
                        message={toast.message}
                    />
                ))}
            </div>
        </>
    );
};

export default ImportExportPage;
