// lib/calculate.ts

/**
 * Zamienia wszystkie przecinki na kropki i, jeżeli ciąg zaczyna się od "=",
 * wylicza wyrażenie tak jak w Excelu.
 * Przed wszystkim usuwa znaki inne niż 0-9, . , = + - * /
 *
 * @param input oryginalny tekst z pola
 * @returns wynik obliczenia lub sam tekst z zamienionymi przecinkami
 */
export function calculate(input: string): string {
    // 1) Usuń wszystkie znaki inne niż 0-9 . , = + - * /
    const cleaned = input.replace(/[^0-9=+\-*/.,]/g, "");

    // 2) Zamień przecinki na kropki i obetnij spacje
    const withDots = cleaned.replace(/,/g, ".").trim();

    // 3) Jeśli nie zaczyna się od "=", zwróć tekst już z kropkami
    if (!withDots.startsWith("=")) {
        return withDots;
    }

    // 4) Przygotuj wyrażenie: obetnij początkowe "=", zostaw tylko cyfry, operatory i kropki
    //    (dodatkowa sanitizacja na wszelki wypadek)
    const expr = withDots.slice(1).replace(/[^0-9+\-*/(). ]/g, "");

    try {
        // eslint-disable-next-line no-new-func
        const result = Function(`"use strict"; return (${expr})`)();

        // jeśli wyszedł poprawny number, zwróć go jako string
        if (typeof result === "number" && !Number.isNaN(result)) {
            return result.toString();
        }

        // w przeciwnym razie zwracamy po prostu treść wyrażenia (bez "=")
        return expr;
    } catch {
        // błąd w obliczeniu → zwracamy treść wyrażenia (bez "=")
        return expr;
    }
}
