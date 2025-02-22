import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";

//
// Hook do debouncingu wartości
//
function useDebounce<T>(value: T, delay: number): T {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebounced(value);
        }, delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debounced;
}

interface AutoSuggestInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    // Funkcja pobierająca dane – np. fetchSearchRecentShops lub fetchItemPredictions
    fetcher: (query: string) => Promise<any[]>;
    // Funkcja przekształcająca wynik z API na etykietę do wyświetlenia
    transformResult?: (item: any) => string;
}

const AutoSuggestInput: React.FC<AutoSuggestInputProps> = ({
    value,
    onChange,
    placeholder,
    fetcher,
    transformResult,
}) => {
    const debouncedValue = useDebounce(value, 300);

    const { data: suggestions = [], isLoading } = useQuery<any[]>({
        queryKey: ["autoSuggest", debouncedValue],
        queryFn: () => fetcher(debouncedValue),
        enabled: debouncedValue.length >= 3,
    });

    // Flaga zapobiegająca automatycznemu pokazywaniu dropdownu po wyborze sugestii
    const [ignoreAutoShow, setIgnoreAutoShow] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null);
    const [inputRect, setInputRect] = useState<DOMRect | null>(null);

    useEffect(() => {
        if (inputRef.current) {
            setInputRect(inputRef.current.getBoundingClientRect());
        }
    }, [value, showSuggestions]);

    useEffect(() => {
        if (!isFocused || ignoreAutoShow) {
            setShowSuggestions(false);
        } else if (
            debouncedValue.length >= 3 &&
            (suggestions.length > 0 || isLoading)
        ) {
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    }, [debouncedValue, suggestions, isLoading, ignoreAutoShow, isFocused]);

    const handleInputChange = (newValue: string) => {
        if (ignoreAutoShow) {
            setIgnoreAutoShow(false);
        }
        onChange(newValue);
    };

    const handleSelect = (suggestion: any) => {
        const newValue = transformResult
            ? transformResult(suggestion)
            : suggestion;
        onChange(newValue);
        setIgnoreAutoShow(true); // zapobiegamy ponownemu pokazywaniu dropdownu
        setShowSuggestions(false);
    };

    // Render listy podpowiedzi przez portal, jeśli znamy pozycję inputa
    const suggestionDropdown =
        showSuggestions && inputRect
            ? ReactDOM.createPortal(
                  <ul
                      style={{
                          top: inputRect.bottom + window.scrollY,
                          left: inputRect.left + window.scrollX,
                          width: inputRect.width,
                      }}
                      className="absolute bg-black border border-gray-400 rounded-md shadow-lg max-h-60 overflow-y-auto z-50">
                      {isLoading
                          ? // Wyświetl 3 skeletony
                            [1].map((i) => (
                                <li key={i} className="px-4 py-2">
                                    <div className="h-4 w-full rounded animate-pulse" />
                                </li>
                            ))
                          : suggestions.map((suggestion, idx) => (
                                <li
                                    key={idx}
                                    onClick={() => handleSelect(suggestion)}
                                    className="px-4 py-2 hover:bg-accent cursor-pointer text-gray-100">
                                    {transformResult
                                        ? transformResult(suggestion)
                                        : suggestion}
                                </li>
                            ))}
                  </ul>,
                  document.body
              )
            : null;

    return (
        <div className="relative">
            <Input
                ref={inputRef}
                value={value}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder={placeholder}
                onFocus={() => {
                    setIsFocused(true);
                    if (
                        (suggestions.length > 0 || isLoading) &&
                        !ignoreAutoShow
                    ) {
                        setShowSuggestions(true);
                    }
                }}
                onClick={() => {
                    if (
                        (suggestions.length > 0 || isLoading) &&
                        !ignoreAutoShow
                    ) {
                        setShowSuggestions(true);
                    }
                }}
                onBlur={() => {
                    // Opóźnienie umożliwia kliknięcie w element z listy
                    setTimeout(() => setShowSuggestions(false), 200);
                }}
            />
            {suggestionDropdown}
        </div>
    );
};

export default AutoSuggestInput;

