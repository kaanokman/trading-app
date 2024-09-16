import React, { useEffect, useState } from "react";
import axios from 'axios';//

import "./Trade.css"
import "./Balance.css"

export default function Balance({ clientID, setClientID, balance, setBalance, message, setMessage, showMessage, setShowMessage, portfolio, setPortfolio }) {

    const [loading, setLoading] = useState(true);
    const [amount, setAmount] = useState('');
    const [portfolioValue, setPortfolioValue] = useState('');

    const formatPrice = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    };

    const handleDeposit = (e) => {

        const depositAmount = parseFloat(amount);
        if (depositAmount <= 0) {
            alert('Please enter a valid deposit amount');
            return;
        }

        // console.log(typeof(balance))

        console.log("current balance: " + balance)

        setShowMessage(false);

        let clientData = { "client_id": clientID, "change": depositAmount }

        axios.post('http://127.0.0.1:5000/update_balance', clientData)
            .then(response => {

                // console.log(typeof(balance))
                // console.log(typeof(amount))


                console.log("new balance: " + (balance + depositAmount))

                setBalance(balance + depositAmount);
            })

    }

    const handleWithdraw = (e) => {

        const withdrawAmount = parseFloat(amount);
        if (withdrawAmount <= 0) {
            alert('Please enter a valid withdraw amount');
            return;
        }


        console.log("current balance: " + balance)

        setShowMessage(false);

        let clientData = { "client_id": clientID }

        axios.post('http://127.0.0.1:5000/get_balance', clientData)
            .then(response => {
                const { client_balance } = response.data;


                if (client_balance < withdrawAmount) {
                    setMessage("Balance not enough for withdraw request.");
                    setShowMessage(true);
                }
                else {
                    let clientData = { "client_id": clientID, "change": -withdrawAmount }

                    axios.post('http://127.0.0.1:5000/update_balance', clientData)
                        .then(response => {
                            console.log("new balance: " + (balance - withdrawAmount))

                            setBalance(balance - withdrawAmount);

                        })
                }

            })
            .catch(error => {
                console.error('Error occurred:', error);
            });

    }

    const calculateTotalValue = (portfolioData) => {
        return portfolioData.reduce((acc, row) => {
            const value = parseFloat(row[2].replace(/[^0-9.-]+/g, ''));
            return acc + (isNaN(value) ? 0 : value);
        }, 0);
    };

    useEffect(() => {
        if (clientID && clientID !== "null") {

            setPortfolioValue(calculateTotalValue(portfolio))
        }
        else {
            setPortfolioValue(0);
        }
    }, [clientID, portfolio]);

    useEffect(() => {
        if (clientID && clientID !== "null") {
            const clientData = { client_id: clientID };
            axios.post('http://127.0.0.1:5000/get_balance', clientData)
                .then(response => {
                    const { client_balance } = response.data;
                    setBalance(client_balance);
                    // console.log("initial:" + typeof(client_balance))
                    setLoading(false)
                })
                .catch(error => {
                    console.error('Error occurred:', error);
                });
        }
        else {
            setBalance(0);
            setLoading(false);
        }
    }, [clientID, setBalance]);

    return (
        <>
            {loading ? (<div className="spinner"></div>) : (

                <div className="grid_balance">

                    <div className="balance_text">

                        Balance
                    </div>

                    <div className="balance_value">

                        {formatPrice(balance)}
                    </div>

                    <div className="portfolio_text">

                        Portfolio
                    </div>

                    <div className="portfolio_value">

                        {formatPrice(portfolioValue)}
                    </div>


                    {clientID && clientID !== "null" ? (

                        <>

                            <div className="amount">

                                <input type="number" className="amount-field"
                                    placeholder="Amount"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    required>

                                </input>

                            </div>

                            <div className="deposit">

                                <button type="button" className="deposit-button" onClick={(e) => {
                                    if (amount.trim() === '') {
                                        alert('Amount is required');
                                        return;
                                    }
                                    handleDeposit();
                                }}>
                                    DEPOSIT
                                </button>

                            </div>

                            <div className="withdraw">

                                <button type="button" className="withdraw-button" onClick={(e) => {
                                    if (amount.trim() === '') {
                                        alert('Amount is required');
                                        return;
                                    }
                                    handleWithdraw();
                                }}>
                                    WITHDRAW
                                </button>

                            </div>

                        </>

                    ) : (

                        <>

                            <div className="amount">

                                <input type="number" disabled className="amount-field"
                                    placeholder="Amount"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    required>

                                </input>

                            </div>

                            <div className="deposit">

                                <button type="button" disabled className="deposit-button" onClick={(e) => {
                                    if (amount.trim() === '') {
                                        alert('Amount is required');
                                        return;
                                    }
                                    handleDeposit();
                                }}>
                                    DEPOSIT
                                </button>

                            </div>

                            <div className="withdraw">

                                <button type="button" disabled className="withdraw-button" onClick={(e) => {
                                    if (amount.trim() === '') {
                                        alert('Amount is required');
                                        return;
                                    }
                                    handleWithdraw();
                                }}>
                                    WITHDRAW
                                </button>

                            </div>

                        </>

                    )}

                </div>

            )}
        </>
    );
}