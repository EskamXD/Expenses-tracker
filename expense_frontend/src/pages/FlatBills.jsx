import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, Modal, Form, Table, Spinner } from "react-bootstrap";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import CallSplitIcon from "@mui/icons-material/CallSplit";

import SummaryListGroup from "../components/SummaryListGroup";
import { selectSummaryOptions } from "../config/selectOption";

const FlatBills = () => {
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(
        new Date().getMonth() + 1
    );
    const [bills, setBills] = useState([]);
    const [billPayer, setBillPayer] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showSplitModal, setShowSplitModal] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [users, setUsers] = useState([]);
    const [splitUser, setSplitUser] = useState("-");
    const [paymentDate, setPaymentDate] = useState(
        new Date().toISOString().split("T")[0]
    ); /**< State to manage the selected payment date. */

    useEffect(() => {
        setLoading(true);
        const fetchBills = async () => {
            try {
                const response = await axios.get(
                    "http://localhost:8000/api/bills/",
                    {
                        params: { year: selectedYear, month: selectedMonth },
                    }
                );
                setBills(response.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchBills();
    }, [selectedMonth, selectedYear]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get(
                    "http://localhost:8000/api/groups/"
                );
                setUsers(response.data);
            } catch (error) {
                console.error(error);
            }
        };

        fetchUsers();
    }, []);

    const handleShowSplitModal = (transactionId, billPayer) => {
        setSelectedTransaction(transactionId);
        setBillPayer(billPayer);
        setShowSplitModal(true);
    };

    const handleSplit = async () => {
        if (!selectedTransaction || !splitUser) return;

        try {
            // Update backend with the split information
            await axios.post("http://localhost:8000/api/bills/", {
                transaction_id: selectedTransaction,
                split_user_id: splitUser,
            });

            // Refresh the bills after the update
            const response = await axios.get(
                "http://localhost:8000/api/bills/",
                {
                    params: { year: selectedYear, month: selectedMonth },
                }
            );
            setBills(response.data);
        } catch (error) {
            console.error("Error splitting the bill:", error);
        } finally {
            setShowSplitModal(false);
            setSelectedTransaction(null);
            setSplitUser("-");
        }
    };

    const handleDateChange = (e) => {
        const newDate = moment(e.target.value).format("YYYY-MM-DD");
        setPaymentDate(newDate);
        setItems((prevItems) =>
            prevItems.map((item) => ({ ...item, paymentDate: newDate }))
        );
    };

    return (
        <>
            <h1>Rachunki</h1>
            <SummaryListGroup
                selectedYear={selectedYear}
                setSelectedYear={setSelectedYear}
                selectedMonth={selectedMonth}
                setSelectedMonth={setSelectedMonth}
                itemsLoaded={true}
            />
            {loading ? (
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            ) : (
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>Data</th>
                            <th>Wartość</th>
                            <th>Opis</th>
                            <th>Własność</th>
                            <th>Płacący</th>
                            <th></th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {bills.map((bill) =>
                            bill.transactions.map((transaction) => (
                                <tr key={transaction.id}>
                                    <td width={"15%"}>{bill.payment_date}</td>
                                    <td width={"20%"}>{transaction.value}</td>
                                    <td width={"20%"}>
                                        {transaction.description}
                                    </td>
                                    <td width={"20%"}>
                                        {
                                            selectSummaryOptions[
                                                transaction.owner
                                            ]
                                        }
                                    </td>
                                    <td width={"20%"}>
                                        {selectSummaryOptions[bill.payer]}
                                    </td>
                                    <td width={"5%"}>
                                        <Button
                                            id={`edit-button-${transaction.id}`}
                                            variant="light">
                                            <EditRoundedIcon />
                                        </Button>
                                    </td>
                                    <td width={"5%"}>
                                        <Button
                                            id={`split-button-${transaction.id}`}
                                            onClick={() =>
                                                handleShowSplitModal(
                                                    transaction.id,
                                                    bill.payer
                                                )
                                            }
                                            variant="light">
                                            <CallSplitIcon />
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </Table>
            )}

            {/* Split Modal */}
            <Modal
                show={showSplitModal}
                onHide={() => setShowSplitModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Podziel rachunek</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="formSplitUser">
                            <Form.Label>
                                Wybierz użytkownika do podziału
                            </Form.Label>
                            <Form.Control
                                as="select"
                                value={splitUser}
                                onChange={(e) => setSplitUser(e.target.value)}>
                                <option value="-">Wybierz użytkownika</option>
                                {users.map((group) =>
                                    group.users_array
                                        .filter(
                                            (user) =>
                                                user.username !== billPayer
                                        )
                                        .map((user) => (
                                            <option
                                                key={user.id}
                                                value={user.id}>
                                                {user.name}
                                            </option>
                                        ))
                                )}
                            </Form.Control>
                            <Form.Control
                                type="date"
                                className="mb-3 mt-1rem"
                                value={paymentDate} // Ensuring form uses state for date
                                onChange={handleDateChange}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={() => setShowSplitModal(false)}>
                        Zamknij
                    </Button>
                    <Button variant="success" onClick={handleSplit}>
                        Podziel
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default FlatBills;
