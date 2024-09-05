import React from "react";
import UnifiedItem from "./UnifiedItem";
import {
    selectExpensesOptions,
    selectIncomeOptions,
} from "../config/selectOption";

const ReceiptDetails = ({
    transactions = [],
    setTransactions,
    transactionType,
    selectedOwner,
}) => {
    // Log to understand what values are being passed in
    console.log(
        "ReceiptDetails - transactions:",
        transactions,
        " owner: ",
        selectedOwner
    );

    return (
        <>
            {transactions.map((item) => (
                <UnifiedItem
                    key={item.id}
                    item={item}
                    items={transactions}
                    setItems={setTransactions}
                    selectOptions={
                        transactionType === "expense"
                            ? selectExpensesOptions
                            : selectIncomeOptions
                    }
                    showQuantity={true}
                />
            ))}
        </>
    );
};

export default ReceiptDetails;
