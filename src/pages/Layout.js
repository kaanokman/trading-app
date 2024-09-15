import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { ClientContext } from "../index";
import { useContext } from "react";

import '../Header.css';

const Layout = ({ balance, setBalance }) => {

    const { clientID, setClientID } = useContext(ClientContext);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        setClientID(null);
        navigate('/home');
    };

    const handleLogin = () => {
        navigate('/home');
    };

    return (
        <>

            <div className="header">

                <div className="header-nav">

                    <div>
                        <Link to="/home" className={location.pathname === "/home" ? "active" : ""}>
                            Home
                        </Link>
                    </div>

                    <div>
                        <Link to="/dashboard" className={location.pathname === "/dashboard" ? "active" : ""}>
                            Dashboard
                        </Link>
                    </div>

                </div>

                <div className="header-item">

                    <div className="header-item-child">
                        {clientID && clientID !== "null" ? (

                            <button className="logout-button" onClick={handleLogout}>
                                LOG OUT
                            </button>

                        ) : (
                            <button className="logout-button" onClick={handleLogin}>
                                LOG IN
                            </button>
                        )
                        }
                    </div>

                    <div className="header-item-child">

                        {clientID ? "Logged in as " + clientID : "Not logged in"}

                    </div>

                </div>

            </div>

            <Outlet />

        </>
    );
};

export default Layout;