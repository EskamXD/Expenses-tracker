/**
 * @file Funkcja pobierająca bilans za poprzedni miesiąc (suma przychodów - suma wydatków).
 * @brief Funkcja `previousMonthBalance` pobiera bilans za poprzedni miesiąc (suma przychodów - suma wydatków) dla wybranego właściciela, miesiąca i roku.
 */

import { fetchGetReceipts } from "../services/apiService";
import { Receipt } from "../types";

/**
 * @brief Funkcja pobierająca bilans za poprzedni miesiąc (suma przychodów - suma wydatków).
 *
 * @param {string} owner - Wybrany właściciel, dla którego mają zostać pobrane dane.
 * @param {number} month - Aktualnie wybrany miesiąc (1-12).
 * @param {number} year - Aktualnie wybrany rok.
 * @returns {Promise<number>} Bilans (saldo) za poprzedni miesiąc.
 */
const previousMonthBalance = async (
    owner: number,
    month: number,
    year: number
) => {
    try {
        // Obliczenie poprzedniego miesiąca
        let prevMonth = month - 1;
        let prevYear = year;

        if (prevMonth === 0) {
            prevMonth = 12;
            prevYear -= 1;
        }

        const expenseResponse = await fetchGetReceipts(
            "expense",
            owner,
            prevMonth,
            prevYear
        );
        const incomeResponse = await fetchGetReceipts(
            "income",
            owner,
            prevMonth,
            prevYear
        );

        // Funkcja do sumowania wartości transakcji
        const sumItems = (data: Array<Receipt>) =>
            data
                .flatMap((receipt: Receipt) => receipt.items)
                .reduce((sum, item) => sum + Number(item.value), 0);

        // Obliczenie sumy wydatków i przychodów
        const totalExpenses = sumItems(expenseResponse.data);
        const totalIncome = sumItems(incomeResponse.data);

        // Obliczenie bilansu (saldo) za poprzedni miesiąc
        const balance = totalIncome - totalExpenses;

        return balance;
    } catch (error) {
        console.error("Error fetching previous month's balance:", error);
        throw error;
    }
};

export default previousMonthBalance;
