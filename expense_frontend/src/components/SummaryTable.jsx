import React from "react";
import Table from "react-bootstrap/Table";
import Image from "react-bootstrap/Image"; // Zakładam, że korzystasz z Image z React Bootstrap
import infoIcon from "../assets/images/info.svg"; // Importuj ścieżkę do ikony informacji

const SummaryTable = ({ expenses, requestSort, getSortIndicator, tabKey }) => {
    return (
        <Table striped bordered hover>
            <thead>
                <tr key="header">
                    <th
                        onClick={() => requestSort("category", tabKey)}
                        style={{ userSelect: "none" }}>
                        Kategoria {getSortIndicator("category", tabKey)}
                    </th>
                    <th
                        onClick={() => requestSort("amount", tabKey)}
                        style={{ userSelect: "none" }}>
                        Kwota (PLN) {getSortIndicator("amount", tabKey)}
                    </th>
                    <th
                        onClick={() => requestSort("payment_date", tabKey)}
                        style={{ userSelect: "none" }}>
                        Data {getSortIndicator("payment_date", tabKey)}
                    </th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {expenses.map((expense) => (
                    <tr key={expense.id}>
                        <td>{expense.category}</td>
                        <td>{expense.amount}</td>
                        <td>{expense.payment_date}</td>
                        <td width={"40px"}>
                            <Image src={infoIcon} width={"30px"} />
                        </td>
                    </tr>
                ))}
            </tbody>
        </Table>
    );
};

export default SummaryTable;
