import axios from "axios";

// Funkcja, która pobiera przetworzone dane od backendu
const fetchMonthlyTransactions = async (owner, month, year) => {
    try {
        // Wysyłanie żądania do backendu
        const response = await axios.get(
            `http://localhost:8000/api/fetch-monthly-transactions/`,
            {
                params: {
                    owner: owner,
                    month: month,
                    year: year,
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

