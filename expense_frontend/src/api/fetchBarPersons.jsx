import axios from "axios";

const fetchBarPersons = async (month, year, category) => {
    try {
        // Wysyłanie żądania do backendu
        const response = await axios.get(
            `http://localhost:8000/api/fetch-bar-persons/`,
            {
                params: {
                    month: month,
                    year: year,
                    category: category,
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

export default fetchBarPersons;

