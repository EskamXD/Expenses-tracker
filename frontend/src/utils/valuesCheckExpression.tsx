import { Item } from "../types";

export function validateAndEvaluate(item: Item): {
    status: boolean;
    message: string;
} {
    item.value = String(item.value);
    // console.log("Wartość:", item.value);
    const validOperators = /[+\-*/]/;
    if (item.value[0] === "=") {
        // console.log("Wyrażenie matematyczne:", item.value);
        var expression = item.value.slice(1); // Usunięcie znaku "="

        // Sprawdzenie, czy wyrażenie zawiera dopuszczalne znaki matematyczne

        if (validOperators.test(expression)) {
            try {
                expression = expression.replace(",", "."); // Zamiana przecinka na kropkę
                // console.log("Wyrażenie:", expression);
                // Walidacja nawiasów
                const parenthesesAreValid = checkParentheses(expression);
                // console.log("Nawiasy:", parenthesesAreValid);

                if (!parenthesesAreValid) {
                    console.error("Nieprawidłowa liczba nawiasów.");
                    return {
                        status: false,
                        message: "Nieprawidłowa liczba nawiasów.",
                    };
                }

                // Obliczenie wartości wyrażenia matematycznego
                const result = evaluateExpression(expression);
                // console.log("Wynik:", result);

                // Aktualizacja wartości w elemencie `item`
                item.value = Math.round(Number(result) * 100) / 100;
                // console.log(`Wynik: ${result}`);
                return {
                    status: true,
                    message: `Wynik: ${result}`,
                };
            } catch (error) {
                console.error("Błąd podczas obliczania wyrażenia:", error);
                return {
                    status: false,
                    message: "Błąd podczas obliczania wyrażenia.",
                };
            }
        } else {
            console.error("Brak operatorów matematycznych.");
            return {
                status: false,
                message: "Brak operatorów matematycznych.",
            };
        }
    } else {
        // console.log("Wartość stała:", item.value);
        try {
            if (validOperators.test(item.value)) {
                console.error("Nieprawidłowa wartość.");
                throw new Error("Nieprawidłowa wartość.");
            }

            item.value = item.value.replace(",", ".");
            // Sprawdzenie, czy wartość jest liczbą
            const value = parseFloat(item.value);
            console.log("Wartość liczbowa:", value);

            if (isNaN(value)) {
                console.error("Nieprawidłowa wartość.");
                throw new Error("Nieprawidłowa wartość.");
            }

            item.value = value;
            return {
                status: true,
                message: "Wartość poprawna.",
            };
        } catch (error) {
            console.error("Błąd podczas sprawdzania wartości:", error);
            return {
                status: false,
                message: "Nieprawidłowa wartość.",
            };
        }
    }
}

// Funkcja sprawdzająca poprawność nawiasów
function checkParentheses(expression: string): boolean {
    let balance = 0;

    for (const char of expression) {
        if (char === "(") balance++;
        if (char === ")") balance--;
        if (balance < 0) return false; // Zamykający nawias bez otwierającego
    }

    return balance === 0; // Na końcu bilans musi wynosić 0
}

// Funkcja obliczająca wyrażenie (uwaga na eval)
function evaluateExpression(expression: string): number {
    // Tutaj można dodać bardziej zaawansowaną logikę parsera, ale na razie używamy eval
    return eval(expression);
}
