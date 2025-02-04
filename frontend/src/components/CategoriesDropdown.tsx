import React from "react";
import { useGlobalContext } from "../context/GlobalContext";

interface CategoriesDropdownProps {
    defaultCategory: string;
    transactionType: string;
}

const CategoriesDropdown: React.FC<CategoriesDropdownProps> = () => {
    const { summaryFilters, setSummaryFilters } = useGlobalContext();

    return <></>;
};

export default CategoriesDropdown;

