import { useContext, useEffect } from "react";
import { ClientContext } from "../../index";
import React, { useState } from "react";

import MakeTrade from "./MakeTrade";
import GetTrades from "./GetTrades";
import Balance from "./Balance";
import GetPortfolio from "./GetPortfolio";
import SearchableDropdown from "./SearchableDropdown";

import './Dashboard.css';

export default function Dashboard({ balance, setBalance }) {

    const { clientID, setClientID } = useContext(ClientContext);
    const [message, setMessage] = useState('Message');
    const [showMessage, setShowMessage] = useState(false);

    return (

        <div className="background">

            <div className="dashboard_parent">

                <div className={`message ${showMessage ? 'show' : ''}`}>
                    {message}
                </div>

                {clientID && clientID !== "null" ? (
                    <div className="grid-dashboard">
                        <div className="maketrade_box">
                            <MakeTrade
                                showMessage={showMessage} setShowMessage={setShowMessage}
                                message={message} setMessage={setMessage}
                                clientID={clientID} setClientID={setClientID}
                                balance={balance} setBalance={setBalance} />
                        </div>
                        <div className="balance_box">
                            <Balance
                                clientID={clientID} setClientID={setClientID}
                                balance={balance} setBalance={setBalance}
                            />
                        </div>
                        <div className="portfolio_box">
                            <h1>Portfolio</h1>
                            <GetPortfolio
                                clientID={clientID} setClientID={setClientID}
                                balance={balance} setBalance={setBalance}
                            />
                        </div>
                        <div className="watchlist_box">
                            {/* <Watchlist/> */}
                            <div>Watchlist</div>
                        </div>
                        <div className="gettrades_box">
                            <h1>Trade History</h1>
                            <GetTrades
                                clientID={clientID} setClientID={setClientID}
                                balance={balance} setBalance={setBalance} />
                        </div>
                    </div>
                ) : (<p>Please log in or sign up to view dashboard.</p>)}
            </div>

        </div>

    );
}