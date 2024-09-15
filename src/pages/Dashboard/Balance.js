import React, { useEffect, useState } from "react";
import axios from 'axios';

export default function Balance({ clientID, setClientID, balance, setBalance }) {

    const [loading, setLoading] = useState(true);

    const formattedBalance = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(balance);

    useEffect(() => {
        if (clientID && clientID !== "null") {
            const clientData = { client_id: clientID };
            axios.post('http://127.0.0.1:5000/get_balance', clientData)
                .then(response => {
                    const { client_balance } = response.data;
                    setBalance(client_balance);
                    setLoading(false)
                })
                .catch(error => {
                    console.error('Error occurred:', error);
                });
        }
        else { setBalance(0); }
    }, [clientID, setBalance]);

    return (
        <div>
            {loading ? (<div className="spinner"></div>) : (
                <>
                    {formattedBalance}
                </>
            )}
        </div>
    );
}