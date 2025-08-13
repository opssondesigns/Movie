import React, { useState, useEffect, useRef } from "react";

function SearchBar({ onSearch, placeholder = "Search..." }) {
    const [query, setQuery] = useState("");
    const firstRun = useRef(true);
    const debounceTimer = useRef(null);

    useEffect(() => {
        if (firstRun.current) {
            firstRun.current = false;
            return;
        }

        clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => {
            if (query.trim().length >= 2) {
                onSearch(query.trim());
            }
        }, 400);

        return () => clearTimeout(debounceTimer.current);
    }, [query, onSearch]);

    return (
        <input
            type="text"
            value={query}
            placeholder={placeholder}
            onChange={(e) => setQuery(e.target.value)}
            style={{
                padding: "8px 12px",
                fontSize: "16px",
                width: "100%",
                maxWidth: "400px",
                borderRadius: "4px",
                border: "1px solid #ccc",
            }}
            aria-label="Search"
        />
    );
}

export default SearchBar;
