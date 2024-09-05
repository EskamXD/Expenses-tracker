import axios from "axios";

// Funkcja, która pobiera paragony za wybrany miesiąc i zwraca sumy wydatków i przychodów na każdy dzień
const fetchMonthlyTransactions = async (
    selectedOwner,
    selectedMonth,
    selectedYear
) => {
    try {
        // Pobieranie paragonów z wydatkami
        const expenseResponse = await axios.get(
            `http://localhost:8000/api/receipts/?transaction_type=expense&owner=${selectedOwner}&month=${selectedMonth}&year=${selectedYear}`
        );

        // Pobieranie paragonów z przychodami
        const incomeResponse = await axios.get(
            `http://localhost:8000/api/receipts/?transaction_type=income&owner=${selectedOwner}&month=${selectedMonth}&year=${selectedYear}`
        );

        // Przetwarzanie danych - wydatki
        const expenseTransactions = expenseResponse.data.flatMap((receipt) => {
            return receipt.transactions.map((transaction) => ({
                value: parseFloat(transaction.value),
                payment_date: receipt.payment_date, // Dodanie daty płatności
            }));
        });

        // Przetwarzanie danych - przychody
        const incomeTransactions = incomeResponse.data.flatMap((receipt) => {
            return receipt.transactions.map((transaction) => ({
                value: parseFloat(transaction.value),
                payment_date: receipt.payment_date, // Dodanie daty płatności
            }));
        });

        // Tablica na sumy wydatków i przychodów z każdego dnia
        const dailyExpenseSums = {};
        const dailyIncomeSums = {};

        // Iteracja przez wydatki, aby zsumować je na każdy dzień
        expenseTransactions.forEach((transaction) => {
            const date = transaction.payment_date;
            dailyExpenseSums[date] =
                (dailyExpenseSums[date] || 0) + transaction.value;
        });

        // Iteracja przez przychody, aby zsumować je na każdy dzień
        incomeTransactions.forEach((transaction) => {
            const date = transaction.payment_date;
            dailyIncomeSums[date] =
                (dailyIncomeSums[date] || 0) + transaction.value;
        });

        // Zwracamy sumy wydatków i przychodów
        return {
            dailyExpenseSums,
            dailyIncomeSums,
        };
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
};

export default fetchMonthlyTransactions;
