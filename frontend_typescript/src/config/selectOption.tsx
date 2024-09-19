/**
 * @file selectOptions.js
 * @brief Configuration file for selection options used throughout the application.
 *
 * This file defines and exports arrays of objects and an object used as configuration options
 * for dropdown menus in different parts of the application. It includes options for expenses,
 * income, and summary categories.
 */

/**
 * @brief Options for selecting expense categories.
 *
 * The `selectExpensesOptions` array provides a list of options for expense categories
 * used in dropdown menus. Each option includes a `value` for internal processing
 * and a `label` for display purposes.
 */
export const selectExpensesOptions = [
    { value: "fuel", label: "Paliwo" },
    { value: "car_expenses", label: "Wydatki Samochód" },
    { value: "fastfood", label: "Fastfood" },
    { value: "alcohol", label: "Alkohol" },
    { value: "food_drinks", label: "Picie & Jedzenie" },
    { value: "chemistry", label: "Chemia" },
    { value: "clothes", label: "Ubrania" },
    { value: "electronics_games", label: "Elektronika & Gry" },
    { value: "tickets_entrance", label: "Bilety & Wejściówki" },
    { value: "other_shopping", label: "Inne Zakupy" },
    { value: "flat_bills", label: "Mieszkanie & rachunki" },
    { value: "monthly_subscriptions", label: "Miesięczne Subskrypcje" },
    { value: "other_cyclical_expenses", label: "Inne Cykliczne Wydatki" },
    {
        value: "investments_savings",
        label: "Inwestycje, Lokaty & Oszczędności",
    },
    { value: "other", label: "Inne" },
];

/**
 * @brief Options for selecting income categories.
 *
 * The `selectIncomeOptions` array provides a list of options for income categories
 * used in dropdown menus. Each option includes a `value` for internal processing
 * and a `label` for display purposes.
 */
export const selectIncomeOptions = [
    { value: "for_study", label: "Na studia" },
    { value: "work_income", label: "Przychód praca" },
    { value: "family_income", label: "Przychód rodzina" },
    { value: "investments_income", label: "Inwestycje, Lokaty & Oszczędności" },
    { value: "money_back", label: "Zwrot" },
    { value: "other", label: "Inne" },
];

/**
 * @brief Options for selecting translation categories.
 *
 * The `selectTranslationList` array provides a list of options for translation categories
 * used in dropdown menus. Each option includes a `value` for internal processing
 * and a `label` for display purposes.
 */
export const selectTranslationList = [
    { value: "fuel", label: "Paliwo" },
    { value: "car_expenses", label: "Wydatki Samochód" },
    { value: "fastfood", label: "Fastfood" },
    { value: "alcohol", label: "Alkohol" },
    { value: "food_drinks", label: "Picie & Jedzenie" },
    { value: "chemistry", label: "Chemia" },
    { value: "clothes", label: "Ubrania" },
    { value: "electronics_games", label: "Elektronika & Gry" },
    { value: "tickets_entrance", label: "Bilety & Wejściówki" },
    { value: "other_shopping", label: "Inne Zakupy" },
    { value: "flat_bills", label: "Mieszkanie & rachunki" },
    { value: "monthly_subscriptions", label: "Miesięczne Subskrypcje" },
    { value: "other_cyclical_expenses", label: "Inne Cykliczne Wydatki" },
    {
        value: "investments_savings",
        label: "Inwestycje, Lokaty & Oszczędności",
    },
    { value: "other", label: "Inne" },
    { value: "for_study", label: "Na studia" },
    { value: "work_income", label: "Przychód praca" },
    { value: "family_income", label: "Przychód rodzina" },
    { value: "investments_income", label: "Inwestycje, Lokaty & Oszczędności" },
    { value: "money_back", label: "Zwrot" },
    { value: "last_month_balance", label: "Saldo poprzedni miesiąc" },
];

/**
 * @brief Options for selecting a summary category.
 *
 * The `selectPersonOptions` object maps summary types to their labels
 * for use in dropdown menus. It is used to select a summary category, such as
 * individual or common items.
 */
interface selectPersonInterface {
    [key: number]: string | number[];
}

export const selectPersonOptions: selectPersonInterface = {
    1: "Kamil",
    2: "Ania",
    99: [1, 2],
};
