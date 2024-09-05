import axios from "axios";

// Funkcja, która pobiera paragony za wybrany miesiąc i zwraca sumy wydatków i przychodów na każdy dzień
const fetchMonthlyTransactions = async (
    selectedOwner,
    selectedMonth,
    selectedYear,
    allDates
) => {
    try {
        // Pobieranie paragonów dla wydatków i przychodów jednocześnie
        const [expenseResponse, incomeResponse] = await Promise.all([
            axios.get(
                `http://localhost:8000/api/receipts/?transaction_type=expense&owner=${selectedOwner}&month=${selectedMonth}&year=${selectedYear}`
            ),
            axios.get(
                `http://localhost:8000/api/receipts/?transaction_type=income&owner=${selectedOwner}&month=${selectedMonth}&year=${selectedYear}`
            ),
        ]);

        // Funkcja do przetwarzania transakcji
        const processTransactions = (transactions) =>
            transactions.flatMap((receipt) =>
                receipt.transactions.map((transaction) => ({
                    value: parseFloat(transaction.value),
                    payment_date: receipt.payment_date,
                }))
            );

        // Przetwarzanie danych - wydatki i przychody
        const expenseTransactions = processTransactions(expenseResponse.data);
        const incomeTransactions = processTransactions(incomeResponse.data);

        // Tablice na sumy wydatków i przychodów dla każdego dnia
        var dailyExpenseSums = {};
        var dailyIncomeSums = {};

        // Ustawiamy wartości 0 dla każdego dnia z listy dat
        allDates.forEach((date) => {
            dailyExpenseSums[date] = 0;
            dailyIncomeSums[date] = 0;
        });

        // Funkcja do sumowania transakcji na odpowiednie dni
        const sumTransactions = (transactions, dailySums) => {
            transactions.forEach((transaction) => {
                const date = transaction.payment_date;
                if (dailySums[date] !== undefined) {
                    dailySums[date] += transaction.value;
                }
            });
        };

        // Sumowanie wydatków i przychodów
        sumTransactions(expenseTransactions, dailyExpenseSums);
        sumTransactions(incomeTransactions, dailyIncomeSums);

        // Funkcja do konwersji sum na wartości liniowe kumulacyjne
        const convertSumToLinear = (sums) => {
            const linearSum = [];
            for (let i = 0; i < allDates.length; i++) {
                const currentDate = allDates[i];
                if (i === 0) {
                    // Pierwsza wartość to suma z pierwszego dnia
                    linearSum.push(sums[currentDate]);
                } else {
                    // Sumujemy bieżący dzień z poprzednią sumą
                    linearSum.push(sums[currentDate] + linearSum[i - 1]);
                }
            }
            return linearSum;
        };

        // Konwersja wydatków na kumulacyjne
        const linearExpenseSums = convertSumToLinear(dailyExpenseSums);

        // Konwersja przychodów na kumulacyjne (opcjonalnie, jeśli potrzebujesz)
        const linearIncomeSums = convertSumToLinear(dailyIncomeSums);

        // Zwracamy sumy wydatków i przychodów, także dla dni bez zapisów
        return {
            linearExpenseSums,
            linearIncomeSums,
        };
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
};

export default fetchMonthlyTransactions;
