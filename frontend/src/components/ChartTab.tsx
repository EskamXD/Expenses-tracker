// ChartTab.tsx
import { useState, useEffect, useCallback } from "react";
import { Row, Col, Button } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
// import SummaryListGroup from "./SummaryListGroup";
import LoadingChart from "./LoadingChart";
import LineChartComponent from "./Charts/LineChartComponent";
import BarChartComponent from "./Charts/BarChartComponent";
import CheckboxGroup from "./CheckboxGroup";
import {
    fetchBarPersons,
    fetchBarShops,
    fetchLineSums,
} from "../services/apiService";
import { Params } from "../types";
import {
    selectExpensesOptions,
    selectPersonOptions,
} from "../config/selectOption";
import Spinner from "react-bootstrap/esm/Spinner";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import moment from "moment";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import "../assets/styles/main.css";

// interface BarPersonInterface {
//     payer: number;
//     common: number;
//     mutual: number;
// }
interface ShopBarInterface {
    shop: string;
    expense_sum: number;
}

const trimShops = (
    shopBars: ShopBarInterface[]
): { trimmedShops: ShopBarInterface[]; otherShops: ShopBarInterface[] } => {
    /* Chceck lenght and if > 20 trim to 20, rest shops add to new "other" category */
    if (shopBars.length > 19) {
        const trimmedShops = shopBars.slice(0, 19);
        const otherShops = shopBars.slice(19);
        const otherSum = otherShops.reduce(
            (acc, shop) => acc + shop.expense_sum,
            0
        );
        trimmedShops.push({ shop: "Inne", expense_sum: otherSum });
        return { trimmedShops, otherShops };
    } else {
        // Jeśli długość jest <= 20, zwracamy oryginalną tablicę i pustą tablicę
        return { trimmedShops: shopBars, otherShops: [] };
    }
};

const generateDatesForSelectedMonth = (year: number, month: number) => {
    const daysInMonth = new Date(year, month, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) =>
        moment(new Date(year, month - 1, i + 1)).format("DD-MM-YYYY")
    );
};

const trendLine = (
    linearIncomeSums: number[],
    selectedYear: number,
    selectedMonth: number
) => {
    const monthDaysCount = new Date(selectedYear, selectedMonth, 0).getDate();
    const maxDailySpendings = Math.max(...linearIncomeSums) / monthDaysCount;
    return Array.from(
        { length: monthDaysCount },
        (_, i) => maxDailySpendings * (i + 1)
    );
};

interface ChartTabProps {
    tab: string;
    selectedOwner: number;
    selectedYear: number;
    selectedMonth: number;
}

const ChartTab: React.FC<ChartTabProps> = ({
    tab,
    selectedOwner,
    selectedYear,
    selectedMonth,
}) => {
    const [selectedCategories, setSelectedCategories] = useState([
        "fuel",
        "car_expenses",
        "fastfood",
        "alcohol",
        "food_drinks",
        "chemistry",
        "clothes",
        "electronics_games",
        "tickets_entrance",
        "delivery",
        "other_shopping",
    ]);
    const [itemsLoaded, setItemsLoaded] = useState(false);
    const [lineSumsParams, setLineSumsParams] = useState({
        series: [
            {
                label: "Wydatki",
                data: [0],
                showMark: false,
            },
            {
                label: "Przychody",
                data: [0],
                showMark: false,
            },
            {
                label: "Linia trendu",
                data: [0],
                showMark: false,
            },
        ],
    });
    const [dateValues, setDateValues] = useState(
        generateDatesForSelectedMonth(selectedYear, selectedMonth)
    );
    const [barShopsParams, setBarShopsParams] = useState({
        series: [
            {
                data: [0],
                stack: [""],
            },
        ],
    });
    const [barPersonsParams, setBarPersonsParams] = useState({
        series: [
            {
                // label: "",
                data: [0],
                stack: [""],
            },
        ],
    });
    const [barShopsNamesXAxis, setBarShopsNamesXAxis] = useState<string[]>([]);
    const [barPersonsNamesXAxis, setBarPersonsNamesXAxis] = useState<string[]>(
        []
    );
    const [loading, setLoading] = useState({
        lineSumsChart: false,
        barShops: false,
        barPersons: false,
    });
    const [showModalOther, setShowModalOther] = useState(false);
    const [otherShops, setOtherShops] = useState<ShopBarInterface[]>([]);

    const fetchFunction = useCallback(async () => {
        setLoading({
            lineSumsChart: true,
            barShops: true,
            barPersons: true,
        });

        const params = {
            owner: selectedOwner !== 100 ? selectedOwner : undefined,
            year: selectedYear,
            month: selectedMonth,
            category: selectedCategories,
        } as Params;

        const response = await fetchLineSums(params);

        const trendValues = trendLine(
            response.linearIncomeSums,
            selectedYear,
            selectedMonth
        );
        const generatedDateValues = generateDatesForSelectedMonth(
            selectedYear,
            selectedMonth
        );
        setDateValues(generatedDateValues);

        const barShopsArray = trimShops(await fetchBarShops(params));
        setOtherShops(barShopsArray.otherShops);

        const barPersonsArray = await fetchBarPersons(params);
        console.log("Bar persons array", barPersonsArray);

        if (trendValues)
            setLineSumsParams({
                series: [
                    {
                        label: "Wydatki",
                        data: response.linearExpenseSums,
                        showMark: false,
                    },
                    {
                        label: "Przychody",
                        data: response.linearIncomeSums,
                        showMark: false,
                    },
                    {
                        label: "Linia trendu",
                        data: trendValues,
                        showMark: false,
                    },
                ],
            });

        setBarShopsParams({
            series: [
                {
                    data: barShopsArray.trimmedShops.map(
                        (data: any) => data.expense_sum
                    ),
                    stack: barShopsArray.trimmedShops.map(
                        (data: any) => data.shop
                    ),
                },
            ],
        });

        const transformedData = [
            {
                data: barPersonsArray.map((person: any) =>
                    Number(person.common)
                ),
                stack: barPersonsArray.map(
                    (person: any) => selectPersonOptions[person.payer]
                ),
                label: "Wspólne",
            },
            {
                data: barPersonsArray.map((person: any) =>
                    Number(person.mutual)
                ),
                stack: barPersonsArray.map(
                    (person: any) => selectPersonOptions[person.payer]
                ),
                label: "Wzajemne",
            },
        ];

        // Przypisz dane do `setBarPersonsParams`
        setBarPersonsParams({
            series: transformedData,
        });
        setBarShopsNamesXAxis(
            barShopsArray.trimmedShops.map((shop: any) => shop.shop)
        );
        setBarPersonsNamesXAxis(
            barPersonsArray.map(
                (person: any) => selectPersonOptions[person.payer]
            )
        );
    }, [selectedOwner, selectedMonth, selectedYear, selectedCategories]);

    useEffect(() => {
        if (selectedOwner !== -1 && tab === "charts") {
            setItemsLoaded(false);
            fetchFunction();
        }

        console.log("Selected owner changed", selectedOwner);
    }, [selectedOwner, selectedMonth, selectedYear]);

    useEffect(() => {
        if (selectedOwner !== -1) {
            setItemsLoaded(true);
        }
        console.log(barPersonsParams);
    }, [lineSumsParams, barShopsParams, barPersonsParams]);

    useEffect(() => {
        const generatedDateValues = generateDatesForSelectedMonth(
            selectedYear,
            selectedMonth
        );
        setDateValues(generatedDateValues);
    }, [selectedYear, selectedMonth]);

    const handleBarChartCategoryChange = (selected: string[]) => {
        setSelectedCategories(selected);
    };

    const handleShowModalOther = () => {
        setShowModalOther(true);
    };

    const handleCloseModalOther = () => {
        setShowModalOther(false);
    };

    const theme = createTheme({
        palette: { mode: "dark" },
    });

    return (
        <div className="center-div-top">
            <Col className="pt-1rem" style={{ margin: "0", width: "100%" }}>
                <div className="center-div d-flex flex-column">
                    {selectedOwner !== -1 && (
                        <ThemeProvider theme={theme}>
                            {selectedOwner !== -1 && !itemsLoaded ? (
                                <Spinner animation="border" role="status">
                                    <span className="sr-only"></span>
                                </Spinner>
                            ) : (
                                <div>
                                    <div className="mb-3">
                                        <h2 className="text-center">
                                            Wykres wydatków i przychodów dla{" "}
                                            {selectPersonOptions[selectedOwner]}
                                        </h2>
                                        <LoadingChart
                                            isLoading={
                                                !itemsLoaded &&
                                                loading.lineSumsChart
                                            }
                                            chartComponent={
                                                <LineChartComponent
                                                    lineSumsParams={
                                                        lineSumsParams
                                                    }
                                                    dateValues={dateValues}
                                                />
                                            }
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <h2 className="text-center">
                                            Wykres wydatków w sklepach dla{" "}
                                            {selectPersonOptions[selectedOwner]}
                                        </h2>

                                        <BarChartComponent
                                            xAxisData={barShopsNamesXAxis}
                                            seriesData={barShopsParams}
                                            height={500}
                                            label="Sklepy"
                                        />

                                        {otherShops.length > 0 && (
                                            <div className="justify-end">
                                                <h4 className="mr-1rem">
                                                    Inne sklepy{" "}
                                                </h4>
                                                <Button
                                                    id={`info-button-barShops`}
                                                    variant="light"
                                                    style={{
                                                        marginRight: "50px",
                                                    }}
                                                    onClick={() =>
                                                        handleShowModalOther()
                                                    }>
                                                    {/* Optional: Icon or image to visually indicate more information */}
                                                    <InfoRoundedIcon />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                    <Row className="mb-3">
                                        <h2 className="text-center">
                                            Wykres zależności wydatków dla osób
                                            (kto wydał ile na wspólne rzeczy)
                                        </h2>
                                        <Col>
                                            <BarChartComponent
                                                xAxisData={barPersonsNamesXAxis}
                                                seriesData={barPersonsParams}
                                                height={500}
                                                label="Osoby"
                                            />
                                        </Col>
                                        <Col>
                                            <CheckboxGroup
                                                options={selectExpensesOptions}
                                                selectedCategories={
                                                    selectedCategories
                                                }
                                                handleChange={
                                                    handleBarChartCategoryChange
                                                }
                                            />
                                            <Button
                                                variant="primary"
                                                onClick={fetchFunction}
                                                style={{ width: "100%" }}>
                                                Aktualizuj wykres
                                            </Button>
                                        </Col>
                                    </Row>
                                </div>
                            )}
                        </ThemeProvider>
                    )}
                </div>
            </Col>
            {/* Show modal with other shops */}
            <Modal show={showModalOther} onHide={handleCloseModalOther}>
                <Modal.Header closeButton>
                    <Modal.Title id="modal-modal-title">
                        Inne sklepy
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div>
                        {otherShops.map((shop) => (
                            <p key={shop.shop}>
                                {shop.shop} - {shop.expense_sum} zł
                            </p>
                        ))}
                    </div>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default ChartTab;
