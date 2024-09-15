import React, { useState, useEffect, useContext } from "react";
import axios from 'axios';

import "./Trade.css"


export default function Portfolio({ balance, setBalance, clientID, setClientID }) {
    const [portfolio, setPortfolio] = useState([]);
    const columns = ['Stock', 'Shares', 'Price Paid', 'Value', 'Change'];

    // Function to format price
    const formatPrice = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    };

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (clientID && clientID !== "null") {

            const clientData = { client_id: clientID };

            axios.post('http://127.0.0.1:5000/get_portfolio', clientData)
                .then(response => {

                    setLoading(false);
                    const data = response.data;
                    const values = Object.keys(data).map(key => {
                        const [stock_ticker, num_shares, total_price_paid, total_value] = data[key];

                        // Define change function
                        const calculateChange = (total_value, total_price_paid) =>
                            total_price_paid ? ((total_value - total_price_paid) / total_price_paid) * 100 : 0;

                        return [
                            stock_ticker,
                            num_shares,
                            formatPrice(total_price_paid),
                            formatPrice(total_value),
                            `${calculateChange(total_value, total_price_paid).toFixed(2)}%`  // Format percentage change
                        ];
                    });
                    setPortfolio(values);

                })
                .catch(error => {
                    console.error('Error occurred:', error);
                });
        }
    }, [clientID, balance, setPortfolio, setLoading]);

    return (
        <>
            {loading ? (
                <div className="spinner_container">
                    <div className="spinner"></div>
                </div>) : (
                <>
                    {clientID && clientID !== "null" ? (
                        portfolio.length > 0 ? (
                            <div className="table_container">
                                <table className="table portfolio">
                                    <thead>
                                        <tr>
                                            {columns.map((column, index) => (
                                                <th key={index}>{column}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {portfolio.map((rowData, rowIndex) => (
                                            <tr key={rowIndex}>
                                                {rowData.map((cellData, cellIndex) => (
                                                    <td key={cellIndex}>{cellData}</td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p>Portfolio is empty.</p>
                        )
                    ) : (
                        <p>Please log in or sign up to view portfolio.</p>
                    )}
                </>
            )}
        </>
    );
}