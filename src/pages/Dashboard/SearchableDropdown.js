import React, { useState, useEffect } from "react";
import axios from "axios";

import "./Trade.css"

export default function SearchableDropdown({ quoteDisplayed, setQuoteDisplayed, stockTicker, setStockTicker, isRequired, setIsRequired }) {
    const [query, setQuery] = useState("");
    const [stock, setStock] = useState("");        
    const [options, setOptions] = useState([]);   
    const [isOpen, setIsOpen] = useState(false);   
    const [isOptionSelected, setIsOptionSelected] = useState(false); 

    useEffect(() => {
        if (query.length > 0) {
            const data = { "query": query };
            axios.post('http://127.0.0.1:5000/search', data)
                .then(response => {
                    setOptions(response.data);      
                    setIsOpen(true);               
                })
                .catch(error => {
                    console.error("Error fetching search results:", error);
                });
        } else {
            setOptions([]); 
            setIsOpen(false);
        }
    }, [query]); 

    // Handle input change
    const handleInputChange = (e) => {
        setQuery(e.target.value);  
        // setIsRequired(true);    
    };

    // Handle selecting an option from the dropdown
    const handleOptionSelect = (option) => {
        const [ticker, company] = option;
        setStockTicker(ticker);
        setStock(`${ticker} - ${company}`);         
        setQuery(`${ticker} - ${company}`);         
        setIsOptionSelected(true);                 
        setIsOpen(false);                         
        setIsRequired(false);                      
    };

    const handleClearSelection = () => {
        setStockTicker("");      
        setStock("");            
        setQuery("");           
        setIsOptionSelected(false); 
        setIsRequired(true);   
    };

    return (
        <div className="search_container_parent">
            <div className="search_container">
                {quoteDisplayed === false ? (
                    <>
                        <input
                            className="search_bar"
                            type="text"
                            value={query}
                            onChange={handleInputChange}
                            placeholder="Search company/ticker..."
                            disabled={isOptionSelected}
                            required={isRequired} 
                        />

                        {isOptionSelected ? (
                            <button
                                type="button"
                                className="red"
                                onClick={handleClearSelection}
                            >
                                X
                            </button>
                        ) : (
                            <button
                                type="button"
                                className="red"
                                onClick={handleClearSelection}
                            >
                                X
                            </button>
                        )}

                    </>

                ) : (
                    <>
                        <input
                            className="search_bar"
                            type="text"
                            value={query}
                            onChange={handleInputChange}
                            placeholder="Search company/ticker..."
                            disabled={isOptionSelected}
                            required={isRequired} 
                        />
                        {isOptionSelected ? (
                            <button
                                disabled
                                type="button"
                                className="red"
                                onClick={handleClearSelection}
                            >
                                X
                            </button>
                        ) : (
                            <button
                                type="button"
                                className="red"
                                onClick={handleClearSelection}
                            >
                                X
                            </button>
                        )}

                    </>

                )}



            </div>

            {/* Dropdown Options */}
            {isOpen && options.length > 0 && !isOptionSelected && (
                <ul className="dropdown">
                    {options.map((option, index) => (
                        <li
                            key={index}
                            onClick={() => handleOptionSelect(option)}
                        >
                            {option[0]} - {option[1]}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
