import { Item } from "../types";

export function validateAndEvaluate(item: Item): boolean {
    item.value = String(item.value);
    if (item.value[0] === "=") {
        const expression = item.value.slice(1); // Usunięcie znaku "="

        // Sprawdzenie, czy wyrażenie zawiera dopuszczalne znaki matematyczne
        const validOperators = /[+\-*/]/;

        if (validOperators.test(expression)) {
            try {
                // Walidacja nawiasów
                const parenthesesAreValid = checkParentheses(expression);

                if (!parenthesesAreValid) {
                    console.error("Nieprawidłowa liczba nawiasów.");
                    return false;
                }

                // Obliczenie wartości wyrażenia matematycznego
                const result = evaluateExpression(expression);

                // Aktualizacja wartości w elemencie `item`
                item.value = Math.round(Number(result) * 100) / 100;
                console.log(`Wynik: ${result}`);
                return true;
            } catch (error) {
                console.error("Błąd podczas obliczania wyrażenia:", error);
                return false;
            }
        } else {
            console.error("Brak operatorów matematycznych.");
            return false;
        }
    } else {
        try {
            // Sprawdzenie, czy wartość jest liczbą
            const value = parseFloat(item.value);

            if (isNaN(value)) {
                console.error("Nieprawidłowa wartość.");
                throw new Error("Nieprawidłowa wartość.");
            }

            item.value = value;
            return true;
        } catch (error) {
            console.error("Błąd podczas sprawdzania wartości:", error);
            return false;
        }
    }
    return false;
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

