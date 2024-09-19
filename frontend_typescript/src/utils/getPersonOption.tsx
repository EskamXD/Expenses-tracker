import { selectPersonOptions } from "../config/selectOption";

export const getPersonOption = (personId: number) => {
    if (Array.isArray(selectPersonOptions[personId])) {
        return selectPersonOptions[personId]
            .map((num) => selectPersonOptions[num] || num)
            .join(", ");
    }
    if (personId === 100) {
        return "Wszyscy";
    }
    return selectPersonOptions[personId];
};
