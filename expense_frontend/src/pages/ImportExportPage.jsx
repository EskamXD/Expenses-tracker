import React, { useEffect, useState } from "react";
import { Button, Form, Spinner, Tab, Tabs } from "react-bootstrap";
import JSZip from "jszip";
import axios from "axios";

import Toaster from "../components/Toaster";

import "../assets/styles/main.css";

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
    const [showToast, setShowToast] = useState({
        successDownload: false,
        failedDownload: false,
        successUpload: false,
        failedUpload: false,
    });

    const [toastArray, setToastArray] = useState([]);

    useEffect(() => {
        const newToastArray = [];

        if (showToast.successDownload) {
            newToastArray.push({
                type: "success",
                header: "Sukces",
                message: "Dane zostały pomyślnie pobrane.",
            });

            setTimeout(() => {
                setShowToast({
                    successDownload: false,
                });
            }, 5500);
        }
        if (showToast.failedDownload) {
            newToastArray.push({
                type: "danger",
                header: "Błąd",
                message: "Błąd podczas pobierania danych.",
            });
            setTimeout(() => {
                setShowToast({
                    failedDownload: false,
                });
            }, 5500);
        }
        if (showToast.successUpload) {
            newToastArray.push({
                type: "success",
                header: "Sukces",
                message: "Dane zostały pomyślnie zaimportowane.",
            });
            setTimeout(() => {
                setShowToast({
                    successUpload: false,
                });
            }, 5500);
        }
        if (showToast.failedUpload) {
            newToastArray.push({
                type: "danger",
                header: "Błąd",
                message: "Błąd podczas importowania danych.",
            });
            setTimeout(() => {
                setShowToast({
                    failedUpload: false,
                });
            }, 5500);
        }

        console.log(newToastArray);
        setToastArray(newToastArray); // Ustawiamy nową tablicę
    }, [showToast]);

    const downloadJsonAsZip = async () => {
        setIsDownloading(true);

        try {
            // 1. Pobierz dane JSON z backendu
            const response = await axios.get(
                "http://localhost:8000/api/receipts/"
            );
            const jsonData = await response.json();

            // 2. Utwórz nowy plik ZIP
            const zip = new JSZip();

            // 3. Dodaj dane JSON do pliku ZIP
            zip.file("data.json", JSON.stringify(jsonData, null, 2));

            // 4. Generuj plik ZIP
            const zipBlob = await zip.generateAsync({ type: "blob" });

            // 5. Utwórz link do pobrania pliku ZIP
            const downloadLink = document.createElement("a");
            downloadLink.href = URL.createObjectURL(zipBlob);
            downloadLink.download = "data.zip";
            downloadLink.click();
            setShowToast({
                successDownload: true,
            });
        } catch (error) {
            console.error(
                "Błąd podczas pobierania lub tworzenia pliku ZIP:",
                error
            );
            setShowToast({
                failedDownload: true,
            });
        } finally {
            setIsDownloading(false);
        }
    };

    const handleFileUpload = (event) => {
        setIsUploading(true);
        event.preventDefault();
        const files = event.target.files;

        if (files.length === 0) {
            setFailedUpload(true);
            return;
        }

        const fileReader = new FileReader();
        fileReader.onload = async (e) => {
            try {
                const content = e.target.result;
                const json = JSON.parse(content);
                // Remove id field from JSON object
                console.log(JSON.stringify(json[0]));

                // Now call fetchData after reading the file content
                const response = await axios.post(
                    "http://localhost:8000/api/receipts/",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(json[0]),
                    }
                );

                if (!response.ok) {
                    throw new Error("Błąd podczas importowania danych");
                }

                console.log("Dane zaimportowane pomyślnie");
                setShowToast({
                    successUpload: true,
                });
            } catch (error) {
                console.error("Błąd podczas importowania danych:", error);
                setShowToast({
                    failedUpload: true,
                });
            } finally {
                setIsUploading(false);
            }
        };

        fileReader.readAsText(files[0]);
    };

    return (
        <>
            <h1>Import/Export</h1>
            <Tabs defaultActiveKey="export" id="import-export-tabs">
                <Tab eventKey="export" title="Eksport">
                    <h2>Eksport</h2>
                    {/* <h4>1. Wybierz zakres dat</h4>
                    <div className="d-flex gap-3 mb-3">
                        <ListGroup horizontal>
                            <ListGroup.Item>
                                <MonthDropdown
                                    selectedMonth={fromMonth}
                                    onSelect={setFromMonth}
                                />
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <YearDropdown
                                    selectedYear={fromYear}
                                    onSelect={setFromYear}
                                />
                            </ListGroup.Item>
                        </ListGroup>
                        <ListGroup horizontal>
                            <ListGroup.Item>
                                <MonthDropdown
                                    selectedMonth={toMonth}
                                    onSelect={setToMonth}
                                />
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <YearDropdown
                                    selectedYear={toYear}
                                    onSelect={setToYear}
                                />
                            </ListGroup.Item>
                        </ListGroup>
                    </div>
                    <h4>2. Eksportuj</h4> */}
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
                        setShowToast={setShowToast}
                    />
                ))}
            </div>
        </>
    );
};

export default ImportExportPage;
