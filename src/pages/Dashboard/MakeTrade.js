import React, { useState } from "react";
import axios from 'axios';

import "./Trade.css"
import "./Dashboard.css"

import SearchableDropdown from "./SearchableDropdown"

export default function MakeTrade({ tradeMade, setTradeMade, showMessage, setShowMessage, message, setMessage, clientID, setClientID, balance, setBalance }) {
    const [stockTicker, setStockTicker] = useState('');
    const [numShares, setNumShares] = useState('');
    const [action, setAction] = useState('BUY');
    const [isStockTickerRequired, setIsStockTickerRequired] = useState(true);
    const [quotePrice, setQuotePrice] = useState('');
    const [totalQuotePrice, setTotalQuotePrice] = useState('');
    const [quoteDisplayed, setQuoteDisplayed] = useState(false);
    const [loading, setLoading] = useState(false);

    // Function to format price
    const formatPrice = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    };

    const handleCancel = (e) => {
        setShowMessage(false)
        setQuotePrice(0)
        setTotalQuotePrice(0)
        setQuoteDisplayed(false);

    }

    const handleQuote = (e) => {

        e.preventDefault();

        if (numShares <= 0) {
            alert('Please enter a valid number of shares');
            return;
        }

        setLoading(true);

        setShowMessage(false);


        if (stockTicker === '' && isStockTickerRequired) {
            setMessage('Please select a stock ticker.');
            setShowMessage(true)
            return;
        }

        else {

            setQuoteDisplayed(true);

            const quoteData = {
                stock_ticker: stockTicker
            };

            axios.post('http://127.0.0.1:5000/get_quote', quoteData)
                .then(response => {
                    const { message, stock_price } = response.data;
                    console.log(message)
                    if (message === null) {
                        setMessage('Quote Successful!');
                        setLoading(false);
                        // setShowMessage(true)

                        setQuotePrice(stock_price);
                        console.log(stock_price)

                        setTotalQuotePrice(stock_price * numShares)
                    } else {
                        setMessage(message);
                        setShowMessage(true);
                        setLoading(false);
                    }
                })
                .catch(error => {
                    console.error('Error occurred:', error);
                    setMessage('An error occurred trying to get a quote.');
                    setShowMessage(true);
                    setLoading(false);

                });
        }


    }
    const handleTrade = (e) => {

        e.preventDefault();

        setShowMessage(false);

        if (stockTicker === '' && isStockTickerRequired) {
            setMessage('Please select a stock ticker.');
            setShowMessage(true)
            return;
        }


        const tradeData = {
            client_id: clientID,
            stock_ticker: stockTicker,
            num_shares: numShares,
            action: action,
            stock_price: quotePrice
        };

        axios.post('http://127.0.0.1:5000/make_trade', tradeData)
            .then(response => {
                const { message, total_price, old_balance } = response.data;
                if (message === 'Trade Complete.') {
                    setMessage('Trade Successful!');

                    if (tradeMade === 0) { setTradeMade(1) }
                    else { setTradeMade(0) }

                    setQuotePrice(0)
                    setTotalQuotePrice(0)
                    setQuoteDisplayed(false);
                    setStockTicker('')
                    setNumShares('')
                    setAction('BUY')

                    if (action === 'BUY') {
                        setBalance(old_balance - total_price);
                    }
                    if (action === 'SELL') {
                        setBalance(old_balance + total_price);
                    }
                } else {

                    setMessage(message);
                    setQuoteDisplayed(false);
                    setShowMessage(true);

                }
            })
            .catch(error => {
                console.error('Error occurred:', error);
                setMessage('An error occurred during trade.');
            });
    };

    return (
        <>
            {clientID && clientID !== "null" ? (

                <div className="maketrade_box">
                    <div className="text_fields">
                        <div className="title">Make Trade</div>
                        {quoteDisplayed === true ? (
                            <>
                                <div className="text_field">Price/Share</div>
                                <div className="text_field">Total Price</div>
                            </>
                        ) : (
                            <>
                                <div className="text_field_disabled">Price/Share</div>
                                <div className="text_field_disabled">Total Price</div>
                            </>
                        )}
                    </div>

                    <form className="trade_fields" onSubmit={handleQuote}>

                        {quoteDisplayed === false ? (

                            <>

                                <div className="s">
                                    <SearchableDropdown
                                        clientID={clientID}
                                        quoteDisplayed={quoteDisplayed}
                                        setQuoteDisplayed={setQuoteDisplayed}
                                        stockTicker={stockTicker}
                                        setStockTicker={setStockTicker}
                                        isRequired={isStockTickerRequired}
                                        setIsRequired={setIsStockTickerRequired} />
                                </div>
                                <input className="f"
                                    type='number'
                                    placeholder="Shares"
                                    value={numShares}
                                    onChange={(e) => setNumShares(e.target.value)}
                                    required
                                />
                                <select className="f" value={action} onChange={(e) => setAction(e.target.value)}>
                                    <option value="BUY">BUY</option>
                                    <option value="SELL">SELL</option>
                                </select>

                            </>

                        ) : (

                            <>



                                <div className="s disabled">
                                    <SearchableDropdown
                                        disabled
                                        stockTicker={stockTicker}
                                        setStockTicker={setStockTicker}
                                        isRequired={isStockTickerRequired}
                                        setIsRequired={setIsStockTickerRequired} />
                                </div>
                                <input className="f"
                                    disabled
                                    type='number'
                                    placeholder="Shares"
                                    value={numShares}
                                    onChange={(e) => setNumShares(e.target.value)}
                                    required
                                />
                                <select disabled className="f" value={action}>
                                    <option value="BUY">BUY</option>
                                    <option value="SELL">SELL</option>
                                </select>





                            </>

                        )}

                        {quoteDisplayed === false || loading === true ? (

                            <>

                                {loading ? (

                                    <button disabled className="trade_button" type="submit">

                                        <div className="spinner_mini">

                                        </div>
                                    </button>

                                ) : (

                                    <button className="trade_button" type="submit">

                                        GET QUOTE

                                    </button>

                                )}


                                <div className="f disabled">
                                    {formatPrice(quotePrice)}
                                </div>

                                <div className="f disabled">
                                    {formatPrice(totalQuotePrice)}
                                </div>

                                <button disabled type="button" className="buy_button">
                                    {action}
                                </button>

                                <button disabled type="button" className="cancel_button">
                                    CANCEL
                                </button>
                            </>

                        ) : (

                            <>

                                {loading ? (

                                    <button disabled className="trade_button" type="submit">

                                        <div className="spinner_mini">

                                        </div>
                                    </button>

                                ) : (

                                    <button className="trade_button" type="submit">

                                        GET QUOTE

                                    </button>

                                )}

                                <div className="f">
                                    {formatPrice(quotePrice)}
                                </div>

                                <div className="f">
                                    {formatPrice(totalQuotePrice)}
                                </div>

                                <button type="button" className="buy_button" onClick={handleTrade}>
                                    {action}
                                </button>

                                <button type="button" className="cancel_button" onClick={handleCancel}>
                                    CANCEL
                                </button>

                            </>
                        )}


                    </form>
                </div>


            ) : (
                <div className="maketrade_box">
                    <div className="text_fields">
                        <div className="title">Make Trade</div>
                        <div className="text_field_disabled">Price/Share</div>
                        <div className="text_field_disabled">Total Price</div>
                    </div>

                    <form className="trade_fields" onSubmit={handleQuote}>



                        <div className="s disabled">
                            <SearchableDropdown
                                disabled
                                stockTicker={stockTicker}
                                setStockTicker={setStockTicker}
                                isRequired={isStockTickerRequired}
                                setIsRequired={setIsStockTickerRequired} />
                        </div>
                        <input className="f"
                            disabled
                            type='number'
                            placeholder="Shares"
                            value={numShares}
                            onChange={(e) => setNumShares(e.target.value)}
                            required
                        />
                        <select disabled className="f" value={action}>
                            <option value="BUY">BUY</option>
                            <option value="SELL">SELL</option>
                        </select>




                        <button disabled className="trade_button" type="submit">

                            GET QUOTE

                        </button>




                        <div className="f disabled">
                            {formatPrice(quotePrice)}
                        </div>

                        <div className="f disabled">
                            {formatPrice(totalQuotePrice)}
                        </div>

                        <button disabled type="button" className="buy_button">
                            {action}
                        </button>

                        <button disabled type="button" className="cancel_button">
                            CANCEL
                        </button>


                    </form>
                </div>
            )}

        </>
    );
}