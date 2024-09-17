import React, { useState, useEffect } from "react";
import axios from 'axios';

import "./Trade.css"

export default function GetTrades({ tradeMade, setTradeMade, clientID, setClientID, balance, setBalance }) {
    const [trades, setTrades] = useState([]);
    const columns = ['Stock', 'Action', 'Shares', 'Price', 'Total Price', 'Date & Time'];

    const [loading, setLoading] = useState(true);

    // Function to format price
    const formatPrice = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    };

    useEffect(() => {
        const clientData = { client_id: clientID };
        if (clientID && clientID !== "null") {
            axios.post('http://127.0.0.1:5000/get_trades', clientData)
                .then(response => {
                    setLoading(false);
                    const data = response.data;
                    // Map and sort the trades by date in descending order
                    const values = Object.keys(data)
                        .map(key => {
                            const [stock, action, shares, pricePerShare, totalPrice, dateTime] = data[key];
                            return [
                                stock,
                                action,
                                shares,
                                formatPrice(pricePerShare), // Format Price Per Share
                                formatPrice(totalPrice),   // Format Total Price
                                dateTime
                            ];
                        })
                        .sort((a, b) => new Date(b[5]) - new Date(a[5])); // Sort by dateTime descending

                    setTrades(values);
                })
                .catch(error => {
                    console.error('Error occurred:', error);
                });
        }
        else {
            setLoading(false);
        }
    }, [clientID, tradeMade, setLoading]);

    return (
        <>
            {loading ? (
                <div className="table_container">
                    <div className="spinner_container">
                        <div className="spinner"></div>
                    </div>
                </div>) : (



                <div className="table_container">
                    <table className="table trades">
                        <thead>
                            <tr>
                                {columns.map((column, index) => (
                                    <th key={index}>{column}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {trades.map((rowData, rowIndex) => (
                                <tr key={rowIndex}>
                                    {rowData.map((cellData, cellIndex) => (
                                        <td key={cellIndex}>{cellData}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>



            )}
        </>
    );
}
