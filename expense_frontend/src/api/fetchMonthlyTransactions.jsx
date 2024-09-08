import axios from "axios";

// Funkcja, która pobiera przetworzone dane od backendu
const fetchMonthlyTransactions = async (
    selectedOwner,
    selectedMonth,
    selectedYear,
    allDates
) => {
    try {
        // Wysyłanie żądania do backendu
        const response = await axios.get(
            `http://localhost:8000/api/fetch-monthly-transactions/`,
            {
                params: {
                    owner: selectedOwner,
                    month: selectedMonth,
                    year: selectedYear,
                },
            }
        );

        // Zwracanie przetworzonych danych
        return response.data;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
};

export default fetchMonthlyTransactions;
