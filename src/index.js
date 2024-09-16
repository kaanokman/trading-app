import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./pages/Layout";
import Dashboard from "./pages/Dashboard/Dashboard";
import Home from "./pages/Home/Home";

import React, { useState, createContext } from "react";

import './App.css';

export const ClientContext = createContext();

export default function App() {

    const [clientID, setClientID] = useState('123abc');
    const [balance, setBalance] = useState(0);

    return (
        <ClientContext.Provider value={{ clientID, setClientID }}>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Layout balance={balance} setBalance={setBalance} />}>
                        <Route path="home" element={<Home />} />
                        <Route path="dashboard" element={<Dashboard balance={balance} setBalance={setBalance} />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </ClientContext.Provider>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
