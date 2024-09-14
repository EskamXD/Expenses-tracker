import axios from "axios";
import qs from "qs";

// Funkcja, która pobiera przetworzone dane od backendu
export const fetchLineSums = async (owner, month, year) => {
    try {
        // Wysyłanie żądania do backendu
        const response = await axios.get(
            `http://localhost:8000/api/fetch-line-sums/`,
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

export const fetchBarPersons = async (month, year, category) => {
    try {
        console.log(
            `http://localhost:8000/api/fetch-bar-persons/?month=${month}&year=${year}&category=${category}`
        );
        // Wysyłanie żądania do backendu
        const response = await axios.get(
            `http://localhost:8000/api/fetch-bar-persons/`,
            {
                params: {
                    month: month,
                    year: year,
                    category: category,
                },
                paramsSerializer: (params) => {
                    // Funkcja, która serializuje tablicę na query param
                    return qs.stringify(params, { arrayFormat: "repeat" });
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

export const fetchBarShops = async (owner, month, year) => {
    try {
        // Wysyłanie żądania do backendu
        const response = await axios.get(
            `http://localhost:8000/api/fetch-bar-shops/`,
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

export const fetchPieCategories = async (owner, month, year) => {
    try {
        // Wysyłanie żądania do backendu
        const response = await axios.get(
            `http://localhost:8000/api/fetch-pie-categories/`,
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
