// src/components/SummaryTab.jsx

import React, { useState, useEffect } from "react";
import { Col, Row, Spinner } from "react-bootstrap";
import SummaryTable from "./SummaryTable";
import SummaryListGroup from "./SummaryListGroup";
import axios from "axios";
import "../assets/styles/main.css";

const SummaryTab = ({ transactionType }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(
        new Date().getMonth() + 1
    );
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedOwner, setSelectedOwner] = useState("-");
    const [itemsLoaded, setItemsLoaded] = useState(false);
    const [reload, setReload] = useState(false);

    const fetchItems = async (transactionType, owner, month, year) => {
        setLoading(true);
        try {
            const response = await axios.get(
                `http://localhost:8000/api/receipts/?transaction_type=${transactionType}${
                    owner !== "all" ? `&owner=${owner}` : ""
                }&month=${month}&year=${year}`
            );
            setItems(response.data);
            setItemsLoaded(true);
        } catch (error) {
            console.error("Error fetching items:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedOwner !== "-") {
            setItemsLoaded(false);
            fetchItems(
                transactionType,
                selectedOwner,
                selectedMonth,
                selectedYear
            );
        }
    }, [transactionType, selectedOwner, selectedMonth, selectedYear]);

    useEffect(() => {
        if (reload) {
            setItemsLoaded(false);
            fetchItems(
                transactionType,
                selectedOwner,
                selectedMonth,
                selectedYear
            );
            setReload(false);
        }
    }, [reload]);

    return (
        <div className="center-div-top" id="main">
            <Col className="pt-1rem" style={{ margin: "0", width: "100%" }}>
                <SummaryListGroup
                    selectedOwner={selectedOwner}
                    setSelectedOwner={setSelectedOwner}
                    selectedYear={selectedYear}
                    setSelectedYear={setSelectedYear}
                    selectedMonth={selectedMonth}
                    setSelectedMonth={setSelectedMonth}
                    itemsLoaded={itemsLoaded}
                />
                {loading ? (
                    <div className="center-div">
                        <Spinner animation="border" role="status">
                            <span className="sr-only"></span>
                        </Spinner>
                    </div>
                ) : (
                    <Row
                        className="pt-1rem"
                        style={{ margin: "0", width: "100%" }}>
                        {itemsLoaded && (
                            <SummaryTable
                                list={items}
                                transactionType={transactionType}
                                selectedOwner={selectedOwner}
                                reload={reload}
                                setReload={setReload}
                            />
                        )}
                    </Row>
                )}
            </Col>
        </div>
    );
};

export default SummaryTab;
