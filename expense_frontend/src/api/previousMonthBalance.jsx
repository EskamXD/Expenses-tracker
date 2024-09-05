/**
 * @file Funkcja pobierająca bilans za poprzedni miesiąc (suma przychodów - suma wydatków).
 * @brief Funkcja `previousMonthBalance` pobiera bilans za poprzedni miesiąc (suma przychodów - suma wydatków) dla wybranego właściciela, miesiąca i roku.
 */

import axios from "axios";

/**
 * @brief Funkcja pobierająca bilans za poprzedni miesiąc (suma przychodów - suma wydatków).
 *
 * @param {string} selectedOwner - Wybrany właściciel, dla którego mają zostać pobrane dane.
 * @param {number} selectedMonth - Aktualnie wybrany miesiąc (1-12).
 * @param {number} selectedYear - Aktualnie wybrany rok.
 * @returns {Promise<number>} Bilans (saldo) za poprzedni miesiąc.
 */
const previousMonthBalance = async (
    selectedOwner,
    selectedMonth,
    selectedYear
) => {
    try {
        // Obliczenie poprzedniego miesiąca
        let prevMonth = selectedMonth - 1;
        let prevYear = selectedYear;

        if (prevMonth === 0) {
            prevMonth = 12;
            prevYear -= 1;
        }

        // Pobranie paragonów dla wydatków i przychodów za poprzedni miesiąc
        const [expenseResponse, incomeResponse] = await Promise.all([
            axios.get(
                `http://localhost:8000/api/receipts/?transaction_type=expense&owner=${selectedOwner}&month=${prevMonth}&year=${prevYear}`
            ),
            axios.get(
                `http://localhost:8000/api/receipts/?transaction_type=income&owner=${selectedOwner}&month=${prevMonth}&year=${prevYear}`
            ),
        ]);

        // Funkcja do sumowania wartości transakcji
        const sumTransactions = (data) =>
            data
                .flatMap((receipt) => receipt.transactions)
                .reduce(
                    (sum, transaction) => sum + parseFloat(transaction.value),
                    0
                );

        // Obliczenie sumy wydatków i przychodów
        const totalExpenses = sumTransactions(expenseResponse.data);
        const totalIncome = sumTransactions(incomeResponse.data);

        // Obliczenie bilansu (saldo) za poprzedni miesiąc
        const balance = totalIncome - totalExpenses;

        return balance;
    } catch (error) {
        console.error("Error fetching previous month's balance:", error);
        throw error;
    }
};

export default previousMonthBalance;
