import { useContext, useEffect } from "react";
import { ClientContext } from "../../index";
import React, { useState } from "react";

import MakeTrade from "./MakeTrade";
import GetTrades from "./GetTrades";
import Balance from "./Balance";
import Portfolio from "./Portfolio";
import SearchableDropdown from "./SearchableDropdown";

import './Dashboard.css';

export default function Dashboard({ balance, setBalance }) {

    const { clientID, setClientID } = useContext(ClientContext);
    const [message, setMessage] = useState('Message');
    const [showMessage, setShowMessage] = useState(false);
    const [portfolio, setPortfolio] = useState([]);
    const [tradeMade, setTradeMade] = useState(0);

    return (

        <div className="background">

            <div className="dashboard_parent">

                <div className={`message ${showMessage ? 'show' : ''}`}>
                    {message}
                </div>

                <div className="grid-dashboard">
                    <div className="maketrade_box">
                        <MakeTrade
                        tradeMade={tradeMade} setTradeMade={setTradeMade}
                            showMessage={showMessage} setShowMessage={setShowMessage}
                            message={message} setMessage={setMessage}
                            clientID={clientID} setClientID={setClientID}
                            balance={balance} setBalance={setBalance} />
                    </div>
                    <div className="balance_box">
                        <Balance
                        portfolio={portfolio} setPortfolio={Portfolio}
                            showMessage={showMessage} setShowMessage={setShowMessage}
                            message={message} setMessage={setMessage}
                            clientID={clientID} setClientID={setClientID}
                            balance={balance} setBalance={setBalance}
                        />
                    </div>
                    <div className="portfolio_box">
                        <h1>Portfolio</h1>
                        <Portfolio
                        tradeMade={tradeMade} setTradeMade={setTradeMade}
                        portfolio={portfolio} setPortfolio={setPortfolio}
                        clientID={clientID} setClientID={setClientID}
                            balance={balance} setBalance={setBalance}
                        />
                    </div>
                    {/* <div className="watchlist_box">
                        <div>Watchlist</div>
                    </div> */}
                    <div className="gettrades_box">
                        <h1>Trade History</h1>
                        <GetTrades
                    tradeMade={tradeMade} setTradeMade={setTradeMade}
                            clientID={clientID} setClientID={setClientID}
                            balance={balance} setBalance={setBalance} />
                    </div>
                </div>
            </div>

        </div>

    );
}