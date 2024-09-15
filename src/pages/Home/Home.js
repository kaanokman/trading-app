import { useContext } from "react";
import { ClientContext } from "../../index";
import Login from "./Login"
import Signup from "./Signup"
import './Home.css';

export default function Home() {

    const { clientID, setClientID } = useContext(ClientContext);

    return (

        <div className="background">

            <div className="grid-login">

                <div className="welcome-text">

                    Trading & Portfolio Analytics App

                </div>

                <div className="login-box">

                    <Login clientID={clientID} setClientID={setClientID} />

                </div>

                <div className="signup-box">

                    <Signup clientID={clientID} setClientID={setClientID} />

                </div>

            </div>

        </div>

    );
}