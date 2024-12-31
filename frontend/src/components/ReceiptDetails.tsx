import UnifiedItem from "./UnifiedItem";
import {
    selectExpensesOptions,
    selectIncomeOptions,
} from "../config/selectOption";
import { Item } from "../types";

interface ReceiptDetailsProps {
    items: Item[];
    setItems: Function;
    transactionType: string;
}

const ReceiptDetails: React.FC<ReceiptDetailsProps> = ({
    items = [],
    setItems,
    transactionType,
}) => {
    // Log to understand what values are being passed in

    return (
        <>
            {items.map((item) => (
                <UnifiedItem
                    key={item.id}
                    item={item}
                    items={items}
                    setItems={setItems}
                    removeItem={() => {}}
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
